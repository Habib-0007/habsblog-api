import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { AppError } from './errorhandler.middleware';
import asyncHandler from '../utils/asynchandler.utils';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError('Not authorized to access this route', 401),
      );
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return next(new AppError('User not found', 404));
      }

      next();
    } catch (err) {
      return next(
        new AppError('Not authorized to access this route', 401),
      );
    }
  },
);

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('Not authorized to access this route', 401),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
