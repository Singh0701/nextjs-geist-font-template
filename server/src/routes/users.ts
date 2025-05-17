import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  getUserProfile,
  updateUserProfile,
  getUserNetwork
} from '../controllers/usersController';

const router = express.Router();

// Validation middleware
const validateUpdateProfile = [
  body('bio')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Bio cannot be empty if provided'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each photo URL must be a non-empty string'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each interest must be a non-empty string'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  body('location.type')
    .optional()
    .equals('Point')
    .withMessage('Location type must be Point'),
  body('location.coordinates')
    .optional()
    .isArray()
    .isLength({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  body('location.description')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Location description cannot be empty if provided'),
  validateRequest
];

// Apply auth middleware to all routes
router.use(protect);

// User routes
router.get('/profile', getUserProfile);
router.get('/profile/:userId', getUserProfile);
router.put('/profile', validateUpdateProfile, updateUserProfile);
router.get('/network', getUserNetwork);

export default router;
