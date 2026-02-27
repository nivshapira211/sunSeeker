"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recommendationController_1 = require("../controllers/recommendationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
const limiter = (0, express_rate_limit_1.default)({
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
router.get('/', authMiddleware_1.protect, limiter, recommendationController_1.getRecommendation);
exports.default = router;
