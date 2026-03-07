import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.AI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_or_chatgpt_api_key' ? new GoogleGenerativeAI(apiKey) : null;
/** Model ID for generateContent. Default gemini-1.5-flash (often has free-tier quota); override with GEMINI_MODEL. */
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';
const CAPTION_QUOTA_MSG = "AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.";

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
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Recommend 3 specific types of locations or general advice for finding the best sunrise/sunset spots based on this user preference: "${query}". Keep it concise.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to fetch recommendations at this time.";
  }
};

export const getCaptionSuggestion = async (context: { location?: string; type?: string }): Promise<string> => {
  if (!genAI) {
    return "Golden hour magic.";
  }

  const locationPart = context.location?.trim() ? ` at ${context.location}` : "";
  const typePart = context.type === "sunset" ? "sunset" : "sunrise";
  const prompt = `Write one short, engaging Instagram-style caption for a ${typePart} photo${locationPart}. One sentence only, no hashtags. Reply with only the caption text.`;

  const tryModel = async (modelId: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  };

  for (const modelId of [GEMINI_MODEL, FALLBACK_MODEL]) {
    try {
      const text = await tryModel(modelId);
      return text;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const isQuotaOrNotFound = /429|404|quota|not found/i.test(errMsg);
      if (!isQuotaOrNotFound) {
        console.error("AI Caption Error:", error);
        return CAPTION_QUOTA_MSG;
      }
    }
  }
  console.error("AI Caption: all models failed (quota/404)");
  return CAPTION_QUOTA_MSG;
};

/** Generate caption from image buffer using Gemini Vision. */
export const getCaptionSuggestionFromImage = async (
  imageBuffer: Buffer,
  mimeType: string,
  context: { location?: string; type?: string }
): Promise<string> => {
  if (!genAI) {
    return "Golden hour magic.";
  }

  const locationPart = context.location?.trim() ? ` at ${context.location}` : "";
  const typePart = context.type === "sunset" ? "sunset" : "sunrise";
  const prompt = `Look at this photo and write one short, engaging Instagram-style caption for it. Context: ${typePart} photo${locationPart}. Describe what you see and make it evocative. One sentence only, no hashtags. Reply with only the caption text.`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: imageBuffer.toString("base64"),
    },
  };
  const textPart = { text: prompt };
  const parts = [imagePart, textPart];

  const tryModel = async (modelId: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text().trim();
  };

  for (const modelId of [GEMINI_MODEL, FALLBACK_MODEL]) {
    try {
      const text = await tryModel(modelId);
      return text;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const isQuotaOrNotFound = /429|404|quota|not found/i.test(errMsg);
      if (!isQuotaOrNotFound) {
        console.error("AI Caption (image) Error:", error);
        return CAPTION_QUOTA_MSG;
      }
    }
  }
  console.error("AI Caption (image): all models failed (quota/404)");
  return CAPTION_QUOTA_MSG;
};
