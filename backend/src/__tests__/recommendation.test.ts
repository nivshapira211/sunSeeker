import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getRecommendations } from '../services/aiService';

// Mock AI Service
jest.mock('../services/aiService', () => ({
  getRecommendations: jest.fn(),
  detectSunriseSunset: jest.fn(),
  getCaptionSuggestion: jest.fn(),
  getCaptionSuggestionFromImage: jest.fn(),
  getAssistantReply: jest.fn(),
}));

let mongoServer: MongoMemoryServer | null = null;
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register a user to get a token
  const res = await request(app)
    .post('/api/auth/register')
    .field('username', 'recuser')
    .field('email', 'rec@example.com')
    .field('password', 'password123');
  
  token = res.body.token;
}, 65000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Recommendation Endpoints', () => {
  it('should return a recommendation for a valid query', async () => {
    (getRecommendations as jest.Mock).mockResolvedValue('Go to the beach.');

    const res = await request(app)
      .get('/api/recommendations?q=sunset')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('recommendation', 'Go to the beach.');
  });

  it('should return 400 if query is missing', async () => {
    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 if unauthorized', async () => {
    const res = await request(app)
      .get('/api/recommendations?q=sunset');
    
    expect(res.statusCode).toEqual(401);
  });

  it('should handle getRecommendations error', async () => {
    const aiService = require('../services/aiService');
    aiService.getRecommendations.mockRejectedValueOnce(new Error('AI Error'));

    const res = await request(app)
      .get('/api/recommendations?q=sunset')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(500);
  });

  describe('Caption Suggestions', () => {
    it('should return caption suggestion', async () => {
      const aiService = require('../services/aiService');
      aiService.getCaptionSuggestion.mockResolvedValueOnce('Great caption');

      const res = await request(app)
        .get('/api/recommendations/caption?type=sunset&location=Paris')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.suggestion).toBe('Great caption');
    });

    it('should handle caption suggestion error', async () => {
      const aiService = require('../services/aiService');
      aiService.getCaptionSuggestion.mockRejectedValueOnce(new Error('AI Error'));

      const res = await request(app)
        .get('/api/recommendations/caption?type=sunset')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(500);
    });

    it('should handle image caption suggestion', async () => {
      const aiService = require('../services/aiService');
      aiService.getCaptionSuggestionFromImage.mockResolvedValueOnce('Image caption');

      const res = await request(app)
        .post('/api/recommendations/caption')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('test'), 'test.jpg');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.suggestion).toBe('Image caption');
    });

    it('should handle missing image file', async () => {
      const res = await request(app)
        .post('/api/recommendations/caption')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(400);
    });

    it('should handle image caption suggestion error', async () => {
      const aiService = require('../services/aiService');
      aiService.getCaptionSuggestionFromImage.mockRejectedValueOnce(new Error('AI Error'));

      const res = await request(app)
        .post('/api/recommendations/caption')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('test'), 'test.jpg');
      
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('Assistant Chat', () => {
    it('should return assistant reply', async () => {
      const aiService = require('../services/aiService');
      aiService.getAssistantReply.mockResolvedValueOnce('Assistant reply');

      const res = await request(app)
        .post('/api/recommendations/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages: [{ role: 'user', text: 'Hello' }] });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.reply).toBe('Assistant reply');
    });

    it('should handle missing messages array', async () => {
      const res = await request(app)
        .post('/api/recommendations/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(res.statusCode).toEqual(400);
    });

    it('should handle missing user role', async () => {
      const res = await request(app)
        .post('/api/recommendations/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages: [{ role: 'assistant', text: 'Hello' }] });
      
      expect(res.statusCode).toEqual(400);
    });

    it('should handle assistant reply error', async () => {
      const aiService = require('../services/aiService');
      aiService.getAssistantReply.mockRejectedValueOnce(new Error('AI Error'));

      const res = await request(app)
        .post('/api/recommendations/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages: [{ role: 'user', text: 'Hello' }] });
      
      expect(res.statusCode).toEqual(500);
    });
  });
});
