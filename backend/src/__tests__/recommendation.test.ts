import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getRecommendations } from '../services/aiService';

// Mock AI Service
jest.mock('../services/aiService', () => ({
  getRecommendations: jest.fn(),
  detectSunriseSunset: jest.fn(),
}));

let mongoServer: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register a user to get a token
  const res = await request(app)
    .post('/api/auth/register')
    .field('username', 'recuser')
    .field('email', 'rec@example.com')
    .field('password', 'password123');
  
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
});
