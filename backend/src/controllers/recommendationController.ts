import { Request, Response } from 'express';
import { getRecommendations, getCaptionSuggestion, getCaptionSuggestionFromImage } from '../services/aiService';

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
