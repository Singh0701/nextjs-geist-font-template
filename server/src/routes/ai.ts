import express from 'express';
import { body, query } from 'express-validator';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { generatePostPrompt, generateBio } from '../controllers/aiController';

const router = express.Router();

// Validation middleware
const validateGenerateBio = [
  body('keywords')
    .isArray()
    .withMessage('Keywords must be an array')
    .notEmpty()
    .withMessage('Keywords array cannot be empty'),
  body('keywords.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each keyword must be a non-empty string'),
  validateRequest
];

const validateGeneratePrompt = [
  query('location')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  query('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  validateRequest
];

// Apply auth middleware to all routes
router.use(protect);

// AI routes
router.get('/prompts', validateGeneratePrompt, generatePostPrompt);
router.post('/bio', validateGenerateBio, generateBio);

export default router;
