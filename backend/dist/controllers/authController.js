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
exports.googleCallback = exports.refresh = exports.loginUser = exports.registerUser = exports.generateRefreshToken = exports.generateToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const avatar = req.file ? req.file.path : undefined;
    const userExists = yield User_1.default.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    const user = yield User_1.default.create({
        username,
        email,
        password: hashedPassword,
        avatar,
    });
    if (user) {
        const token = (0, exports.generateToken)(user._id.toString());
        const refreshToken = (0, exports.generateRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        yield user.save();
        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
            token,
            refreshToken,
        });
    }
    else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield User_1.default.findOne({ username });
    if (user && user.password && (yield bcryptjs_1.default.compare(password, user.password))) {
        const token = (0, exports.generateToken)(user._id.toString());
        const refreshToken = (0, exports.generateRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        yield user.save();
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
            token,
            refreshToken,
        });
    }
    else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});
exports.loginUser = loginUser;
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(401).json({ message: 'No refresh token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = yield User_1.default.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const token = (0, exports.generateToken)(user._id.toString());
        const newRefreshToken = (0, exports.generateRefreshToken)(user._id.toString());
        user.refreshToken = newRefreshToken;
        yield user.save();
        res.json({ token, refreshToken: newRefreshToken });
    }
    catch (error) {
        res.status(401).json({ message: 'Refresh token expired or invalid' });
    }
});
exports.refresh = refresh;
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Authentication failed' });
            return;
        }
        const token = (0, exports.generateToken)(user._id.toString());
        const refreshToken = (0, exports.generateRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        yield user.save();
        // Redirect to frontend with tokens
        res.redirect(`${process.env.CLIENT_URL || 'https://localhost:5173'}/auth/success?token=${token}&refreshToken=${refreshToken}`);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.googleCallback = googleCallback;
