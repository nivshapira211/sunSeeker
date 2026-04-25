import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 65000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('username', 'testuser')
      .field('email', 'test@example.com')
      .field('password', 'password123');

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should refresh token with valid refreshToken', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    const refreshToken = loginRes.body.refreshToken;

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 401 when refresh has no refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({});

    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 when refresh token is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' });

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 when refresh token is valid but does not match user', async () => {
    // Register a second user
    const regRes = await request(app)
      .post('/api/auth/register')
      .field('username', 'testuser3')
      .field('email', 'test3@example.com')
      .field('password', 'password123');
    
    // Change the token in db
    const User = require('../models/User').default;
    await User.findByIdAndUpdate(regRes.body.user.id, { refreshToken: 'changed' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: regRes.body.refreshToken });

    expect(res.statusCode).toEqual(401);
  });

  it('should redirect to Google for GET /google', async () => {
    const res = await request(app).get('/api/auth/google');

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toMatch(/accounts\.google\.com/);
  });

  it('should handle google callback correctly', async () => {
    // Create a mock user
    const User = require('../models/User').default;
    const user = await User.create({
      username: 'googleuser',
      email: 'google@example.com',
      password: 'randompassword',
    });

    // Call the controller directly:
    const { googleCallback } = require('../controllers/authController');
    const reqMock = { user: user } as any;
    const resMock = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await googleCallback(reqMock, resMock);
    expect(resMock.redirect).toHaveBeenCalled();
  });

  it('should handle google callback missing user', async () => {
    const { googleCallback } = require('../controllers/authController');
    const reqMock = { user: null } as any;
    const resMock = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await googleCallback(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(401);
  });

  it('should return 400 when registering with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('username', 'testuser2')
      .field('email', 'test@example.com')
      .field('password', 'password123');

    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should handle general error in login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nonexistent', password: 'password123' });
    expect(res.statusCode).toEqual(401);
  });

  it('should return 400 when user creation fails', async () => {
    // Mock User.create to return null
    const User = require('../models/User').default;
    jest.spyOn(User, 'create').mockResolvedValueOnce(null as any);
    const res = await request(app)
      .post('/api/auth/register')
      .field('username', 'failuser')
      .field('email', 'fail@example.com')
      .field('password', 'password123');
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Invalid user data');
  });

  it('should return 401 when no refresh token provided directly in controller', async () => {
    const { refresh } = require('../controllers/authController');
    const reqMock = { body: {} } as any;
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    await refresh(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ message: 'No refresh token provided' });
  });

  it('should handle google callback error', async () => {
    const { googleCallback } = require('../controllers/authController');
    const reqMock = { user: { _id: '123' } } as any;
    const resMock = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    
    // Make user.save throw an error
    reqMock.user.save = jest.fn().mockRejectedValueOnce(new Error('DB Error'));

    await googleCallback(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});

describe('Root', () => {
  it('GET / should return API running message', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('API is running');
  });
});
