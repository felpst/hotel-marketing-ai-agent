import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateCampaignInput = [
  body('hotelName')
    .trim()
    .notEmpty()
    .withMessage('Hotel name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  
  body('hotelUrl')
    .trim()
    .notEmpty()
    .withMessage('Hotel URL is required')
    .isURL()
    .withMessage('Please provide a valid URL'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(error => error.msg);
      throw new AppError(messages[0], 400);
    }
    next();
  }
]; 