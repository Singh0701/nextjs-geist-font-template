import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler';

// Generate post prompt based on location and interests
export const generatePostPrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { location, interests } = req.query;
    
    if (!location) {
      const error: CustomError = new Error('Location is required');
      error.statusCode = 400;
      throw error;
    }

    // Simple prompt generation logic based on location
    // This can be enhanced with actual AI integration later
    let prompt = '';
    const locationStr = location.toString().toLowerCase();

    if (locationStr.includes('library')) {
      prompt = `Study sesh in ${locationStr}?`;
    } else if (locationStr.includes('soho')) {
      prompt = 'Coffee in SoHo?';
    } else if (locationStr.includes('fidi')) {
      prompt = 'Lunch in FiDi?';
    } else {
      prompt = `Hangout in ${locationStr}?`;
    }

    // If interests are provided, incorporate them into the prompt
    if (interests) {
      const interestList = Array.isArray(interests) 
        ? interests 
        : [interests];
      
      if (interestList.length > 0) {
        const interest = interestList[0].toString();
        prompt = `${interest} meetup in ${locationStr}?`;
      }
    }

    res.json({
      success: true,
      data: {
        prompt,
        suggestions: [
          prompt,
          `Anyone free in ${locationStr}?`,
          `Looking for company in ${locationStr}!`
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI bio from keywords
export const generateBio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      const error: CustomError = new Error('Keywords array is required');
      error.statusCode = 400;
      throw error;
    }

    // Simple bio generation logic
    // This can be enhanced with actual AI integration later
    const bio = `${keywords.join(' | ')} | Looking to connect and collaborate`;

    res.json({
      success: true,
      data: {
        bio,
        suggestions: [
          bio,
          `Passionate about ${keywords.join(', ')}`,
          `${keywords[0]} enthusiast | ${keywords.slice(1).join(' | ')}`
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
