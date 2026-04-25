import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import * as aiService from '../services/aiService';
import * as embeddingService from '../services/embeddingService';

jest.mock('../services/aiService', () => ({
  detectSunriseSunset: jest.fn().mockResolvedValue({ type: 'sunrise' })
}));

jest.mock('../services/embeddingService', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2]),
  composeEmbeddingText: jest.fn().mockReturnValue('test text'),
  cosineSimilarity: jest.fn().mockReturnValue(0.9),
  isEmbeddingConfigured: jest.fn().mockReturnValue(true)
}));

let mongoServer: MongoMemoryServer | null = null;
let token: string;
let userId: string;
let postId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const regRes = await request(app)
    .post('/api/auth/register')
    .field('username', 'postuser')
    .field('email', 'post@example.com')
    .field('password', 'password123');

  token = regRes.body.token;
  userId = regRes.body.user.id;

  const testImage = path.join(__dirname, 'test.jpg');
  fs.writeFileSync(testImage, 'fake data');
  const createRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', testImage)
    .field('caption', 'Test post')
    .field('type', 'sunrise');
  fs.unlinkSync(testImage);
  postId = createRes.body._id;
}, 65000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Post Endpoints', () => {
  it('should create a new post', async () => {
    const testImage = path.join(__dirname, 'test2.jpg');
    fs.writeFileSync(testImage, 'fake data');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', testImage)
      .field('caption', 'Second post')
      .field('type', 'sunset');

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('caption', 'Second post');

    fs.unlinkSync(testImage);
  });

  it('should get all posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.posts).toBeInstanceOf(Array);
    expect(res.body.posts.length).toBeGreaterThan(0);
  });

  it('should search posts by query', async () => {
    const res = await request(app).get('/api/posts/search?q=Test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('posts');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it('should return 400 when search query is missing', async () => {
    const res = await request(app).get('/api/posts/search');
    expect(res.statusCode).toEqual(400);
  });

  describe('detect-type', () => {
    it('should detect image type', async () => {
      const testImage = path.join(__dirname, 'test-detect.jpg');
      fs.writeFileSync(testImage, 'fake data');

      const res = await request(app)
        .post('/api/posts/detect-type')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', testImage);

      fs.unlinkSync(testImage);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('type', 'sunrise');
    });

    it('should return 400 when no image is provided', async () => {
      const res = await request(app)
        .post('/api/posts/detect-type')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should handle detection errors', async () => {
      const testImage = path.join(__dirname, 'test-detect-error.jpg');
      fs.writeFileSync(testImage, 'fake data');

      (aiService.detectSunriseSunset as jest.Mock).mockRejectedValueOnce(new Error('AI Error'));

      const res = await request(app)
        .post('/api/posts/detect-type')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', testImage);

      fs.unlinkSync(testImage);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('semanticSearch', () => {
    it('should search posts by semantic query', async () => {
      // Create a post with embedding first
      const testImage = path.join(__dirname, 'test-semantic.jpg');
      fs.writeFileSync(testImage, 'fake data');
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', testImage)
        .field('caption', 'A beautiful semantic sunset')
        .field('type', 'sunset');
      fs.unlinkSync(testImage);

      const res = await request(app).get('/api/posts/semantic-search?q=sunset');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('posts');
      expect(Array.isArray(res.body.posts)).toBe(true);
    });

    it('should return 400 when semantic search query is missing', async () => {
      const res = await request(app).get('/api/posts/semantic-search');
      expect(res.statusCode).toEqual(400);
    });
  });

  it('should get posts by user id', async () => {
    const res = await request(app).get(`/api/posts/user/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.posts).toBeInstanceOf(Array);
    expect(res.body.posts.length).toBeGreaterThan(0);
  });

  it('should get post by id', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', postId);
    expect(res.body).toHaveProperty('caption', 'Test post');
  });

  it('should return 404 for non-existent post id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/posts/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should update own post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('caption', 'Updated caption');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('caption', 'Updated caption');
  });

  it('should return 401 when updating post without auth', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .field('caption', 'Updated');

    expect(res.statusCode).toEqual(401);
  });

  it('should delete own post', async () => {
    const testImage = path.join(__dirname, 'delete-test.jpg');
    fs.writeFileSync(testImage, 'fake data');
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', testImage)
      .field('caption', 'To delete')
      .field('type', 'sunrise');
    fs.unlinkSync(testImage);
    const idToDelete = createRes.body._id;

    const res = await request(app)
      .delete(`/api/posts/${idToDelete}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    const getRes = await request(app).get(`/api/posts/${idToDelete}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should return 401 when deleting post without auth', async () => {
    const res = await request(app).delete(`/api/posts/${postId}`);
    expect(res.statusCode).toEqual(401);
  });

  it('should toggle like on post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('likes');
    expect(res.body).toHaveProperty('liked');
    expect(typeof res.body.likes).toBe('number');
    expect(typeof res.body.liked).toBe('boolean');
  });

  it('should return 401 when liking without auth', async () => {
    const res = await request(app).post(`/api/posts/${postId}/like`);
    expect(res.statusCode).toEqual(401);
  });

  it('should get comments for post', async () => {
    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should add comment to post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'A comment' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('text', 'A comment');
    expect(res.body).toHaveProperty('_id');
  });

  it('should return 401 when adding comment without auth', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .send({ text: 'A comment' });

    expect(res.statusCode).toEqual(401);
  });

  it('should delete own comment', async () => {
    const addRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Comment to delete' });
    const commentId = addRes.body._id;

    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 401 when deleting comment without auth', async () => {
    const addRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Another comment' });
    const commentId = addRes.body._id;

    const res = await request(app).delete(`/api/posts/${postId}/comments/${commentId}`);
    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 when deleting non-existent comment', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 when deleting comment from wrong post', async () => {
    const addRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Wrong post comment' });
    const commentId = addRes.body._id;

    const fakePostId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${fakePostId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(400);
  });

  it('should handle error in updatePost', async () => {
    const res = await request(app)
      .put(`/api/posts/invalid-id`)
      .set('Authorization', `Bearer ${token}`)
      .field('caption', 'Updated');
    expect(res.statusCode).toEqual(400);
  });

  it('should handle error in deletePost', async () => {
    const res = await request(app)
      .delete(`/api/posts/invalid-id`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(500);
  });

  it('should handle error in toggleLike', async () => {
    const res = await request(app)
      .post(`/api/posts/invalid-id/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(500);
  });

  it('should return 404 for updating non-existent post', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('caption', 'Updated');
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 for deleting non-existent post', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 for toggling like on non-existent post', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/posts/${fakeId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 401 when deleting comment from wrong user', async () => {
    const addRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Another user comment' });
    const commentId = addRes.body._id;

    // create another user
    const regRes = await request(app)
      .post('/api/auth/register')
      .field('username', 'anotheruser')
      .field('email', 'another@example.com')
      .field('password', 'password123');
    const anotherToken = regRes.body.token;

    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${anotherToken}`);
    expect(res.statusCode).toEqual(401);
  });

  it('should handle error in deleteComment', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/invalid-id`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(500);
  });

  it('should handle database errors in various post endpoints', async () => {
    // Test getPosts error
    jest.spyOn(require('../models/Post').default, 'countDocuments').mockRejectedValueOnce(new Error('DB Error'));
    const getRes = await request(app).get('/api/posts');
    expect(getRes.statusCode).toEqual(500);

    // Test searchPosts error
    jest.spyOn(require('../models/Post').default, 'countDocuments').mockRejectedValueOnce(new Error('DB Error'));
    const searchRes = await request(app).get('/api/posts/search?q=test');
    expect(searchRes.statusCode).toEqual(500);

    // Test semanticSearch error
    const embeddingService = require('../services/embeddingService');
    jest.spyOn(embeddingService, 'generateEmbedding').mockRejectedValueOnce(new Error('DB Error'));
    const semanticRes = await request(app).get('/api/posts/semantic-search?q=test');
    expect(semanticRes.statusCode).toEqual(500);

    // Test createPost error
    jest.spyOn(require('../models/Post').default, 'create').mockRejectedValueOnce(new Error('DB Error'));
    const createRes = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`);
    expect(createRes.statusCode).toEqual(400);

    // Test getPostsByUserId error
    jest.spyOn(require('../models/Post').default, 'countDocuments').mockRejectedValueOnce(new Error('DB Error'));
    const userPostsRes = await request(app).get(`/api/posts/user/someuserid`);
    expect(userPostsRes.statusCode).toEqual(500);

    // Test getPostById error
    jest.spyOn(require('../models/Post').default, 'findById').mockReturnValueOnce({
      populate: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
    } as any);
    const getByIdRes = await request(app).get(`/api/posts/${postId}`);
    expect(getByIdRes.statusCode).toEqual(500);

    // Test updatePost error
    jest.spyOn(require('../models/Post').default, 'findById').mockRejectedValueOnce(new Error('DB Error'));
    const updateRes = await request(app).put(`/api/posts/${postId}`).set('Authorization', `Bearer ${token}`);
    expect(updateRes.statusCode).toEqual(400);

    // Test deletePost error
    jest.spyOn(require('../models/Post').default, 'findById').mockRejectedValueOnce(new Error('DB Error'));
    const deleteRes = await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toEqual(500);

    // Test getComments error
    jest.spyOn(require('../models/Comment').default, 'find').mockReturnValueOnce({
      populate: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
    } as any);
    const getCommentsRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(getCommentsRes.statusCode).toEqual(500);

    // Test addComment error
    jest.spyOn(require('../models/Comment').default, 'create').mockRejectedValueOnce(new Error('DB Error'));
    const addCommentRes = await request(app).post(`/api/posts/${postId}/comments`).set('Authorization', `Bearer ${token}`);
    expect(addCommentRes.statusCode).toEqual(400);
  });
});
