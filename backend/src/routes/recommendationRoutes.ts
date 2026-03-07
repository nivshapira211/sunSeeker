import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { getRecommendation, getCaptionSuggestionHandler, getCaptionSuggestionFromImageHandler, postAssistantChat } from '../controllers/recommendationController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import rateLimit from 'express-rate-limit';

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again in an hour',
});

const captionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many caption suggestions, please try again shortly',
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many messages, please try again shortly',
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

/**
 * @swagger
 * /recommendations/caption:
 *   get:
 *     summary: Get AI suggestion for post caption
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *         description: Optional location for context
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [sunrise, sunset] }
 *         description: Optional; sunrise or sunset
 *     responses:
 *       200:
 *         description: Caption suggestion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestion: { type: string }
 */
router.get('/caption', protect, captionLimiter, getCaptionSuggestionHandler);
router.post('/caption', protect, captionLimiter, memoryUpload.single('image'), getCaptionSuggestionFromImageHandler);

router.post(
  '/chat',
  protect,
  chatLimiter,
  [
    body('messages')
      .isArray()
      .withMessage('messages must be an array')
      .custom((val) => {
        if (!Array.isArray(val) || val.length === 0) return Promise.reject(new Error('messages array is required'));
        const last = val[val.length - 1];
        if (!last || last.role !== 'user' || typeof last.text !== 'string') return Promise.reject(new Error('last message must have role "user" and text'));
        return true;
      }),
  ],
  validate,
  postAssistantChat
);

export default router;
