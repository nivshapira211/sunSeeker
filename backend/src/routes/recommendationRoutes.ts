import express from 'express';
import { getRecommendation } from '../controllers/recommendationController';
import { protect } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again in an hour',
});

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: AI-powered sunrise/sunset recommendations
 */

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get AI-powered recommendation for a location or vibe
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query or preference (e.g., "romantic beach")
 *     responses:
 *       200:
 *         description: AI recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendation:
 *                   type: string
 *       400:
 *         description: Missing query parameter
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/', protect, limiter, getRecommendation);

export default router;
