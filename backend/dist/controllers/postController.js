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
exports.addComment = exports.getComments = exports.toggleLike = exports.deletePost = exports.updatePost = exports.getPostById = exports.getPostsByUserId = exports.createPost = exports.searchPosts = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const aiService_1 = require("../services/aiService");
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const totalCount = yield Post_1.default.countDocuments();
        const posts = yield Post_1.default.find({})
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.json({
            posts,
            totalCount,
            hasMore: skip + posts.length < totalCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});
exports.getPosts = getPosts;
const searchPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    if (!query) {
        res.status(400).json({ message: 'Search query is required' });
        return;
    }
    try {
        const totalCount = yield Post_1.default.countDocuments({ $text: { $search: query } });
        const posts = yield Post_1.default.find({ $text: { $search: query } })
            .populate('user', 'username avatar')
            .skip(skip)
            .limit(pageSize);
        res.json({
            posts,
            totalCount,
            hasMore: skip + posts.length < totalCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error searching posts' });
    }
});
exports.searchPosts = searchPosts;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caption, location, time, date, type, coordinates, exif } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const imagePathForAi = req.file ? req.file.path : undefined;
    try {
        let detectedType = type;
        if (!detectedType && imagePathForAi) {
            const aiResult = yield (0, aiService_1.detectSunriseSunset)(imagePathForAi);
            detectedType = aiResult.type === 'unknown' ? 'sunrise' : aiResult.type;
        }
        const post = yield Post_1.default.create({
            imageUrl,
            caption,
            location,
            time,
            date,
            type: detectedType || 'sunrise', // Default to sunrise if not provided and no image
            coordinates: coordinates ? JSON.parse(coordinates) : { lat: 0, lng: 0 },
            exif: exif ? JSON.parse(exif) : { camera: 'Unknown', lens: '', aperture: '', iso: '', shutter: '' },
            user: req.user._id,
        });
        const populatedPost = yield post.populate('user', 'username avatar');
        res.status(201).json(populatedPost);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating post' });
    }
});
exports.createPost = createPost;
const getPostsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    try {
        const totalCount = yield Post_1.default.countDocuments({ user: userId });
        const posts = yield Post_1.default.find({ user: userId })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);
        res.json({
            posts,
            totalCount,
            hasMore: skip + posts.length < totalCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user posts' });
    }
});
exports.getPostsByUserId = getPostsByUserId;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id).populate('user', 'username avatar');
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ message: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching post' });
    }
});
exports.getPostById = getPostById;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (post) {
            if (post.user.toString() !== req.user._id.toString()) {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            post.caption = req.body.caption || post.caption;
            post.location = req.body.location || post.location;
            post.time = req.body.time || post.time;
            post.date = req.body.date || post.date;
            post.type = req.body.type || post.type;
            if (req.file) {
                post.imageUrl = `/uploads/${req.file.filename}`;
            }
            const updatedPost = yield post.save();
            res.json(updatedPost);
        }
        else {
            res.status(404).json({ message: 'Post not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating post' });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (post) {
            if (post.user.toString() !== req.user._id.toString()) {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            yield post.deleteOne();
            res.json({ message: 'Post removed' });
        }
        else {
            res.status(404).json({ message: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting post' });
    }
});
exports.deletePost = deletePost;
const toggleLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (post) {
            const alreadyLiked = post.likes.includes(req.user._id);
            if (alreadyLiked) {
                post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
            }
            else {
                post.likes.push(req.user._id);
            }
            yield post.save();
            res.json({ likes: post.likes.length, liked: !alreadyLiked });
        }
        else {
            res.status(404).json({ message: 'Post not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling like' });
    }
});
exports.toggleLike = toggleLike;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield Comment_1.default.find({ postId: req.params.id }).populate('userId', 'username avatar');
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});
exports.getComments = getComments;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield Comment_1.default.create({
            postId: req.params.id,
            userId: req.user._id,
            text: req.body.text,
        });
        const populatedComment = yield comment.populate('userId', 'username avatar');
        res.status(201).json(populatedComment);
    }
    catch (error) {
        res.status(400).json({ message: 'Error adding comment' });
    }
});
exports.addComment = addComment;
