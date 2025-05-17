import { Request, Response, NextFunction } from 'express';
import { Post, IPost } from '../models/Post';
import { User } from '../models/User';
import { CustomError } from '../middleware/errorHandler';

// Create a new post
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      content,
      type,
      connectionScope,
      location,
      expiresIn,
      maxReplies,
      maxAccepts
    } = req.body;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresIn || 24)); // Default 24h

    const post = new Post({
      content,
      poster: req.user?._id, // Set by auth middleware
      type: type || 'hangout',
      connectionScope: connectionScope || 'second',
      location,
      expiresAt,
      maxReplies: Math.min(maxReplies || 3, 6),
      maxAccepts: Math.min(maxAccepts || 1, 6)
    });

    await post.save();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Get posts feed
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      type,
      connectionScope,
      latitude,
      longitude,
      radius = 10000 // Default 10km radius
    } = req.query;

    const query: any = {
      expiresAt: { $gt: new Date() }
    };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by connection scope if provided
    if (connectionScope) {
      query.connectionScope = connectionScope;
    }

    // Filter by location if coordinates provided
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(radius as string)
        }
      };
    }

    const posts = await Post.find(query)
      .populate('poster', 'username')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// React to a post
export const reactToPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;

    const post = await Post.findById(postId);

    if (!post) {
      const error: CustomError = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if post has expired
    if (post.expiresAt < new Date()) {
      const error: CustomError = new Error('Post has expired');
      error.statusCode = 400;
      throw error;
    }

    // Check if max replies reached
    if (post.replies.length >= post.maxReplies) {
      const error: CustomError = new Error('Maximum replies reached');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already replied
    if (post.replies.some(reply => reply.user.toString() === userId?.toString())) {
      const error: CustomError = new Error('You have already replied to this post');
      error.statusCode = 400;
      throw error;
    }

    // Add reply
    post.replies.push({
      user: userId,
      status: 'pending'
    });

    await post.save();

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update reply status (accept/reject)
export const updateReplyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, userId } = req.params;
    const { status } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      const error: CustomError = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user is the poster
    if (post.poster.toString() !== req.user?._id.toString()) {
      const error: CustomError = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    // Find and update reply status
    const reply = post.replies.find(r => r.user.toString() === userId);
    
    if (!reply) {
      const error: CustomError = new Error('Reply not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if max accepts reached when trying to accept
    if (status === 'accepted' && 
        post.replies.filter(r => r.status === 'accepted').length >= post.maxAccepts) {
      const error: CustomError = new Error('Maximum accepts reached');
      error.statusCode = 400;
      throw error;
    }

    reply.status = status;
    await post.save();

    res.json({
      success: true,
      message: `Reply ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
};
