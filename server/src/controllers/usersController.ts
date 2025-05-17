import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { CustomError } from '../middleware/errorHandler';

// Get user profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || req.user?._id;

    const user = await User.findById(userId)
      .select('-password');

    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Calculate network value (placeholder implementation)
    // This can be enhanced with actual network analysis
    const networkValue = {
      firstDegree: 15, // Example count of direct connections
      secondDegree: 150, // Example count of friends-of-friends
      thirdDegree: 1500, // Example count of third-degree connections
      highlights: [
        "You're 2 degrees from 6 founders in NYC",
        "You're 3 degrees from someone who graduated from NYU"
      ]
    };

    res.json({
      success: true,
      data: {
        user,
        networkValue
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { bio, photos, interests, location } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Update fields if provided
    if (bio !== undefined) user.bio = bio;
    if (photos !== undefined) user.photos = photos;
    if (interests !== undefined) user.interests = interests;
    if (location !== undefined) user.location = location;

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user's network
export const getUserNetwork = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { degree = 'first' } = req.query;

    // Placeholder implementation
    // This should be replaced with actual network traversal logic
    const networkStats = {
      first: {
        count: 15,
        sample: [
          { role: 'Software Engineer', company: 'Tech Corp' },
          { role: 'Product Manager', company: 'StartupCo' }
        ]
      },
      second: {
        count: 150,
        sample: [
          { role: 'Founder', location: 'NYC' },
          { role: 'Designer', company: 'DesignStudio' }
        ]
      },
      third: {
        count: 1500,
        sample: [
          { role: 'Investor', company: 'VC Fund' },
          { role: 'Professor', institution: 'NYU' }
        ]
      }
    };

    res.json({
      success: true,
      data: networkStats[degree as keyof typeof networkStats] || networkStats.first
    });
  } catch (error) {
    next(error);
  }
};
