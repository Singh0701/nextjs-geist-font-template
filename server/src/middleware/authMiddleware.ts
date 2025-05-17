import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CustomError } from './errorHandler';

interface JwtPayload {
  userId: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error: CustomError = new Error('Not authorized - No token provided');
      error.statusCode = 401;
      throw error;
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      const error: CustomError = new Error('Not authorized - User not found');
      error.statusCode = 401;
      throw error;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const customError: CustomError = new Error('Not authorized - Invalid token');
      customError.statusCode = 401;
      next(customError);
    } else {
      next(error);
    }
  }
};
