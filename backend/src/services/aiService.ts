import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.AI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_or_chatgpt_api_key' ? new GoogleGenerativeAI(apiKey) : null;

export const detectSunriseSunset = async (imagePath: string): Promise<{ type: 'sunrise' | 'sunset' | 'unknown', description: string }> => {
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
};

export const getRecommendations = async (query: string): Promise<string> => {
  if (!genAI) {
    return "AI is not configured. Here are some general tips: High places and beaches are great for sunsets.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Recommend 3 specific types of locations or general advice for finding the best sunrise/sunset spots based on this user preference: "${query}". Keep it concise.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to fetch recommendations at this time.";
  }
};
