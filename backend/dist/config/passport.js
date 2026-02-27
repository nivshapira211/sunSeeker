"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'google_client_id_placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google_client_secret_placeholder',
    callbackURL: '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let user = yield User_1.default.findOne({ googleId: profile.id });
        if (!user) {
            // Check if user exists with same email
            user = yield User_1.default.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
            if (user) {
                // Link account
                user.googleId = profile.id;
                if (!user.avatar)
                    user.avatar = (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value;
                yield user.save();
                return done(null, user);
            }
            // Create new user
            user = yield User_1.default.create({
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                email: (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0].value,
                password: Math.random().toString(36).slice(-8), // Random password
                googleId: profile.id,
                avatar: (_d = profile.photos) === null || _d === void 0 ? void 0 : _d[0].value,
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
})));
exports.default = passport_1.default;
