import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

let mongoServer: MongoMemoryServer | null = null;
let token: string;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const res = await request(app)
    .post('/api/auth/register')
    .field('username', 'postuser')
    .field('email', 'post@example.com')
    .field('password', 'password123');
  
  token = res.body.token;
  userId = res.body.user.id;
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
    const testImage = path.join(__dirname, 'test.jpg');
    fs.writeFileSync(testImage, 'fake data');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', testImage)
      .field('caption', 'Test post')
      .field('type', 'sunrise');
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('caption', 'Test post');

    fs.unlinkSync(testImage);
  });

  it('should get all posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.posts).toBeInstanceOf(Array);
    expect(res.body.posts.length).toBeGreaterThan(0);
  });
});
