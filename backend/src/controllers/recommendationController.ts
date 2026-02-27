import { Request, Response } from 'express';
import { getRecommendations } from '../services/aiService';

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
