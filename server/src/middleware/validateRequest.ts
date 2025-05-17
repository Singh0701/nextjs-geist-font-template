import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CustomError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error: CustomError = new Error('Validation Error');
    error.statusCode = 400;
    error.errors = errors.array();
    return next(error);
  }
  
  next();
};
