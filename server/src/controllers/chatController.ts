import { Request, Response, NextFunction } from 'express';
import { Chat, IChat } from '../models/Chat';
import { User } from '../models/User';
import { CustomError } from '../middleware/errorHandler';

// Create a new chat
export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participants, conversationType, conversationName } = req.body;
    const userId = req.user?._id;

    // Ensure current user is included in participants
    if (!participants.includes(userId.toString())) {
      participants.push(userId);
    }

    // For direct chats, ensure only 2 participants
    if (conversationType === 'direct' && participants.length !== 2) {
      const error: CustomError = new Error('Direct chats must have exactly 2 participants');
      error.statusCode = 400;
      throw error;
    }

    // Check if direct chat already exists between these users
    if (conversationType === 'direct') {
      const existingChat = await Chat.findOne({
        conversationType: 'direct',
        participants: { $all: participants }
      });

      if (existingChat) {
        return res.json({
          success: true,
          data: existingChat
        });
      }
    }

    // Create new chat
    const chat = new Chat({
      participants,
      conversationType,
      conversationName: conversationType === 'group' ? conversationName : undefined
    });

    await chat.save();

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// Get all chats for current user
export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username photos')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a specific chat
export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate('messages.sender', 'username photos');

    if (!chat) {
      const error: CustomError = new Error('Chat not found');
      error.statusCode = 404;
      throw error;
    }

    // Mark messages as read
    chat.messages.forEach(message => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    });
    await chat.save();

    res.json({
      success: true,
      data: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

// Send a message in a chat
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      const error: CustomError = new Error('Chat not found');
      error.statusCode = 404;
      throw error;
    }

    const newMessage = {
      sender: userId,
      content,
      readBy: [userId],
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      const error: CustomError = new Error('Chat not found');
      error.statusCode = 404;
      throw error;
    }

    // Mark all unread messages as read
    let updated = false;
    chat.messages.forEach(message => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};
