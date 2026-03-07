import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

let mongoServer: MongoMemoryServer | null = null;
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const res = await request(app)
    .post('/api/auth/register')
    .field('username', 'userprofile')
    .field('email', 'profile@example.com')
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

describe('User Endpoints', () => {
  it('should get current user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'userprofile');
    expect(res.body).toHaveProperty('email', 'profile@example.com');
  });

  it('should return 401 when getting profile without token', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.statusCode).toEqual(401);
  });

  it('should update profile username with valid token', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .field('username', 'newname');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'newname');
    expect(res.body).toHaveProperty('email');
  });

  it('should update profile with avatar when valid token', async () => {
    const testImage = path.join(__dirname, 'avatar.jpg');
    fs.writeFileSync(testImage, 'fake image');

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', testImage)
      .field('username', 'newname');

    fs.unlinkSync(testImage);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    if (res.body.avatar) {
      expect(res.body.avatar).toMatch(/^\/uploads\//);
    }
  });

  it('should return 401 when updating profile without token', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .field('username', 'newname');

    expect(res.statusCode).toEqual(401);
  });
});
