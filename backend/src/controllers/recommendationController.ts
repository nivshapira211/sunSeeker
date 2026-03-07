import { Request, Response } from 'express';
import { getRecommendations, getCaptionSuggestion, getCaptionSuggestionFromImage, getAssistantReply } from '../services/aiService';

export const getRecommendation = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    res.status(400).json({ message: 'Query parameter "q" is required' });
    return;
  }

  try {
    const recommendation = await getRecommendations(query);
    res.json({ recommendation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendation' });
  }
};

export const getCaptionSuggestionHandler = async (req: Request, res: Response) => {
  const location = (req.query.location as string)?.trim() || undefined;
  const type = (req.query.type as string) === 'sunset' ? 'sunset' : 'sunrise';
  try {
    const suggestion = await getCaptionSuggestion({ location, type });
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching caption suggestion' });
  }
};

export const getCaptionSuggestionFromImageHandler = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const location = (req.body?.location as string)?.trim() || undefined;
  const type = (req.body?.type as string) === 'sunset' ? 'sunset' : 'sunrise';
  if (!file?.buffer) {
    res.status(400).json({ message: 'Image file is required for image-based caption suggestion' });
    return;
  }
  try {
    const suggestion = await getCaptionSuggestionFromImage(file.buffer, file.mimetype || 'image/jpeg', { location, type });
    res.json({ suggestion });
  } catch (error) {
    console.error('Caption from image error:', error);
    res.status(500).json({ message: 'Error fetching caption suggestion' });
  }
};

export const postAssistantChat = async (req: Request, res: Response) => {
  const body = req.body as { messages?: Array<{ role: string; text: string }> };
  const raw = body?.messages;

  if (!Array.isArray(raw) || raw.length === 0) {
    res.status(400).json({ message: 'messages array is required' });
    return;
  }
  const last = raw[raw.length - 1];
  if (!last || last.role !== 'user') {
    res.status(400).json({ message: 'last message must have role "user"' });
    return;
  }

  const messages = raw.map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    text: typeof m.text === 'string' ? m.text : '',
  }));

  try {
    const reply = await getAssistantReply(messages);
    res.json({ reply });
  } catch (error) {
    console.error('Assistant chat error:', error);
    res.status(500).json({ message: 'Error getting assistant reply' });
  }
};
