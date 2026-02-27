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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.detectSunriseSunset = void 0;
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.AI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_or_chatgpt_api_key' ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
const detectSunriseSunset = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!genAI) {
        return {
            type: 'unknown',
            description: 'AI detection is not configured.',
        };
    }
    // TODO: Implement actual image analysis using Gemini Vision model
    // This requires reading the file and sending it to the API
    // For now, returning mock if not fully implemented or file reading is complex
    return {
        type: 'sunrise',
        description: 'AI detection placeholder.',
    };
});
exports.detectSunriseSunset = detectSunriseSunset;
const getRecommendations = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!genAI) {
        return "AI is not configured. Here are some general tips: High places and beaches are great for sunsets.";
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Recommend 3 specific types of locations or general advice for finding the best sunrise/sunset spots based on this user preference: "${query}". Keep it concise.`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        return response.text();
    }
    catch (error) {
        console.error("AI Error:", error);
        return "Unable to fetch recommendations at this time.";
    }
});
exports.getRecommendations = getRecommendations;
