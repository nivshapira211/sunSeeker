import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

// Prefer OPENROUTER_API_KEY; fall back to AI_API_KEY only if it looks like an OpenRouter key (sk-or-...)
const rawKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
const OPENROUTER_API_KEY =
  rawKey &&
  rawKey !== 'your_openrouter_api_key' &&
  rawKey !== 'your_gemini_or_chatgpt_api_key' &&
  !String(rawKey).trim().startsWith('AIza') // avoid using Google key with OpenRouter
    ? String(rawKey).trim()
    : process.env.OPENROUTER_API_KEY?.trim() || '';

const isConfigured =
  OPENROUTER_API_KEY.length > 0 && OPENROUTER_API_KEY.startsWith('sk-or-');

/** Model for text and vision. Vision-capable default for image caption and detect. */
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CAPTION_QUOTA_MSG =
  'AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.';

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
};

function extractContent(data: unknown): string {
  const content = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    const first = content[0];
    if (first && typeof first === 'object' && 'text' in first && typeof (first as { text: string }).text === 'string') {
      return (first as { text: string }).text.trim();
    }
  }
  throw new Error('Invalid OpenRouter response: missing choices[0].message.content');
}

async function openRouterChat(
  messages: OpenRouterMessage[],
  model: string = OPENROUTER_MODEL
): Promise<string> {
  const response = await axios.post(
    OPENROUTER_URL,
    { model, messages },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
      validateStatus: () => true,
    }
  );
  if (response.status !== 200) {
    const msg =
      (response.data?.error?.message ?? response.data?.message ?? response.statusText) || `HTTP ${response.status}`;
    throw new Error(`${response.status}: ${msg}`);
  }
  return extractContent(response.data);
}

export const detectSunriseSunset = async (
  imagePath: string
): Promise<{ type: 'sunrise' | 'sunset' | 'unknown'; description: string }> => {
  if (!isConfigured) {
    return { type: 'unknown', description: 'AI detection is not configured.' };
  }

  try {
    const buffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
          {
            type: 'text',
            text: 'Is this photo a sunrise or a sunset? Reply with exactly one word: sunrise, sunset, or unknown.',
          },
        ],
      },
    ];

    const reply = await openRouterChat(messages);
    const word = reply.toLowerCase().replace(/[.\s]/g, '');
    let type: 'sunrise' | 'sunset' | 'unknown' = 'unknown';
    if (word.includes('sunrise')) type = 'sunrise';
    else if (word.includes('sunset')) type = 'sunset';

    return { type, description: reply.slice(0, 200) };
  } catch (error) {
    console.error('AI detectSunriseSunset error:', error);
    return { type: 'unknown', description: 'AI detection failed.' };
  }
};

export const getRecommendations = async (query: string): Promise<string> => {
  if (!isConfigured) {
    return 'AI is not configured. Here are some general tips: High places and beaches are great for sunsets.';
  }

  try {
    const prompt = `Recommend 3 specific types of locations or general advice for finding the best sunrise/sunset spots based on this user preference: "${query}". Keep it concise.`;
    const text = await openRouterChat([{ role: 'user', content: prompt }]);
    return text;
  } catch (error) {
    console.error('AI getRecommendations error:', error);
    return 'Unable to fetch recommendations at this time.';
  }
};

export const getCaptionSuggestion = async (context: {
  location?: string;
  type?: string;
}): Promise<string> => {
  if (!isConfigured) return 'Golden hour magic.';

  const locationPart = context.location?.trim() ? ` at ${context.location}` : '';
  const typePart = context.type === 'sunset' ? 'sunset' : 'sunrise';
  const prompt = `Write one short, engaging Instagram-style caption for a ${typePart} photo${locationPart}. One sentence only, no hashtags. Reply with only the caption text.`;

  try {
    return await openRouterChat([{ role: 'user', content: prompt }]);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (/429|5\d{2}|quota|rate/i.test(errMsg)) {
      console.error('AI Caption (rate/quota):', errMsg);
      return CAPTION_QUOTA_MSG;
    }
    console.error('AI Caption Error:', error);
    return CAPTION_QUOTA_MSG;
  }
};

export const getCaptionSuggestionFromImage = async (
  imageBuffer: Buffer,
  mimeType: string,
  context: { location?: string; type?: string }
): Promise<string> => {
  if (!isConfigured) return 'Golden hour magic.';

  const locationPart = context.location?.trim() ? ` at ${context.location}` : '';
  const typePart = context.type === 'sunset' ? 'sunset' : 'sunrise';
  const prompt = `Look at this photo and write one short, engaging Instagram-style caption for it. Context: ${typePart} photo${locationPart}. Describe what you see and make it evocative. One sentence only, no hashtags. Reply with only the caption text.`;

  const mime = mimeType || 'image/jpeg';
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mime};base64,${base64}`;

  const messages: OpenRouterMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ];

  try {
    return await openRouterChat(messages);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (/429|5\d{2}|quota|rate/i.test(errMsg)) {
      console.error('AI Caption image (rate/quota):', errMsg);
      return CAPTION_QUOTA_MSG;
    }
    console.error('AI Caption (image) Error:', error);
    return CAPTION_QUOTA_MSG;
  }
};

const ASSISTANT_SYSTEM =
  'You are the SunSeeker Assistant. You ONLY provide recommendations for sunrise and sunset viewing: best spots, best times (e.g. golden hour), seasonal or location-specific tips, and photography tips for sunrise/sunset. You do not answer questions on any other topic. If the user asks something unrelated to sunrise or sunset, reply in one short sentence that you can only help with sunrise and sunset recommendations and ask how you can help with that. Keep replies concise.';

const MAX_CHAT_HISTORY = 20;

export const getAssistantReply = async (
  messages: Array<{ role: 'user' | 'model'; text: string }>
): Promise<string> => {
  if (!isConfigured) {
    return 'AI is not configured. I can only help with sunrise and sunset recommendations.';
  }

  const bounded = messages.slice(-MAX_CHAT_HISTORY);
  const openRouterMessages: OpenRouterMessage[] = [
    { role: 'system', content: ASSISTANT_SYSTEM },
    ...bounded.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.text.trim(),
    })),
  ];

  try {
    return await openRouterChat(openRouterMessages);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (/429|5\d{2}|quota|rate/i.test(errMsg)) {
      console.error('AI Assistant (rate/quota):', errMsg);
      return 'AI is temporarily unavailable. Please try again in a moment.';
    }
    console.error('AI Assistant Error:', error);
    return 'AI is temporarily unavailable. Please try again in a moment.';
  }
};
