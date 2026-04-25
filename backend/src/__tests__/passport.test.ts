import passport from '../config/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

jest.mock('../models/User');

describe('Passport Config', () => {
  it('should be defined', () => {
    expect(passport).toBeDefined();
  });

  describe('GoogleStrategy callback', () => {
    let verifyCallback: Function;

    beforeAll(() => {
      // Extract the verify callback from the registered strategy
      const strategy: any = (passport as any)._strategy('google');
      verifyCallback = strategy._verify;
    });

    it('should find an existing user by googleId', async () => {
      const mockUser = { id: 'user1', googleId: '12345' };
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      const done = jest.fn();
      await verifyCallback('token', 'refreshToken', { id: '12345' }, done);

      expect(User.findOne).toHaveBeenCalledWith({ googleId: '12345' });
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should link account if user exists with same email', async () => {
      const mockUser = { id: 'user2', email: 'test@example.com', save: jest.fn() };
      (User.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // googleId not found
        .mockResolvedValueOnce(mockUser); // email found

      const done = jest.fn();
      await verifyCallback('token', 'refreshToken', { id: '12345', emails: [{ value: 'test@example.com' }] }, done);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should create a new user if no match found', async () => {
      const mockUser = { id: 'user3' };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValueOnce(mockUser);

      const done = jest.fn();
      await verifyCallback('token', 'refreshToken', { 
        id: '12345', 
        displayName: 'Test User',
        emails: [{ value: 'new@example.com' }],
        photos: [{ value: 'avatar.jpg' }]
      }, done);

      expect(User.create).toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (User.findOne as jest.Mock).mockRejectedValueOnce(error);

      const done = jest.fn();
      await verifyCallback('token', 'refreshToken', { id: '12345' }, done);

      expect(done).toHaveBeenCalledWith(error, undefined);
    });
  });
});
