"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = express_1.default.Router();
router.get('/', postController_1.getPosts);
router.post('/', authMiddleware_1.protect, uploadMiddleware_1.default.single('image'), postController_1.createPost);
router.get('/:id', postController_1.getPostById);
router.put('/:id', authMiddleware_1.protect, postController_1.updatePost);
router.delete('/:id', authMiddleware_1.protect, postController_1.deletePost);
router.post('/:id/like', authMiddleware_1.protect, postController_1.toggleLike);
router.get('/:id/comments', postController_1.getComments);
router.post('/:id/comments', authMiddleware_1.protect, postController_1.addComment);
exports.default = router;
