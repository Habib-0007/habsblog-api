import { RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from '../config/env.config';
import { Request, Response, NextFunction } from 'express';

const apiRateLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_MAX,
  duration: env.RATE_LIMIT_WINDOW_MS / 1000,
});

const authRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60,
});

export const apiLimiter = (req: Request, res: Response, next: NextFunction) => {
  apiRateLimiter
    .consume(req.ip || '')
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
      });
    });
};

export const authLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  authRateLimiter
    .consume(req.ip || '')
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts, please try again later.',
      });
    });
};
