import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const errors = result.array().map((e) => {
    const err = e as { param?: string; msg: string };
    return { path: err.param ?? 'field', msg: err.msg };
  });
  res.status(400).json({ message: 'Validation failed', errors });
};

export { validationResult };
export type { ValidationChain };
