import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead
} from '../controllers/chatController';

const router = express.Router();

// Validation middleware
const validateCreateChat = [
  body('participants').isArray().notEmpty().withMessage('Participants array is required'),
  body('participants.*').isMongoId().withMessage('Invalid participant ID'),
  body('conversationType').isIn(['direct', 'group']).withMessage('Invalid conversation type'),
  body('conversationName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Conversation name cannot be empty if provided'),
  validateRequest
];

const validateSendMessage = [
  body('content')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message content is required'),
  validateRequest
];

// Apply auth middleware to all chat routes
router.use(protect);

// Chat routes
router.post('/', validateCreateChat, createChat);
router.get('/', getChats);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', validateSendMessage, sendMessage);
router.post('/:chatId/read', markMessagesAsRead);

export default router;
