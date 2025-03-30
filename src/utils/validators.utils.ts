import { body, param, query, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

export const resetPasswordValidator: ValidationChain[] = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const createPostValidator: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot be more than 200 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  // body('tags').optional().isArray().withMessage('Tags must be an array'),
];

export const updatePostValidator: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot be more than 200 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
];

export const createCommentValidator: ValidationChain[] = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  body('postId')
    .trim()
    .notEmpty()
    .withMessage('Post ID is required')
    .isMongoId()
    .withMessage('Invalid post ID format'),
];

export const updateCommentValidator: ValidationChain[] = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
];

export const idParamValidator = (
  paramName: string = 'id',
): ValidationChain[] => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
];

export const paginationValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
