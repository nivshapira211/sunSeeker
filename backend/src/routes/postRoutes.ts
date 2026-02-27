import express from 'express';
import {
  getPosts,
  getPostsByUserId,
  searchPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
} from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Sunrise and sunset posts management
 */

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts by text (caption or location)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of posts matching the search query
 */
router.get('/search', searchPosts);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default 10)
 *     responses:
 *       200:
 *         description: Paginated list of posts
 */
router.get('/', getPosts);

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get posts by a specific user ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose posts to fetch
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of user-specific posts
 */
router.get('/user/:userId', getPostsByUserId);

router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', getPostById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               location:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: integer
 *                 liked:
 *                   type: boolean
 */
router.post('/:id/like', protect, toggleLike);

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

export default router;
