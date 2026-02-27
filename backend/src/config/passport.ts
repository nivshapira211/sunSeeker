import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'google_client_id_placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google_client_secret_placeholder',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails?.[0].value });
          
          if (user) {
             // Link account
             user.googleId = profile.id;
             if (!user.avatar) user.avatar = profile.photos?.[0].value;
             await user.save();
             return done(null, user);
          }

          // Create new user
          user = await User.create({
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
            email: profile.emails?.[0].value,
            password: Math.random().toString(36).slice(-8), // Random password
            googleId: profile.id,
            avatar: profile.photos?.[0].value,
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
