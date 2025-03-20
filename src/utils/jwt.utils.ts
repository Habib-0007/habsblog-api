import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { TokenPayload } from '../types/auth.types';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const setTokenCookie = (res: any, token: string): void => {
  const options = {
    expires: new Date(
      Date.now() + parseInt(env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
  };

  res.cookie('token', token, options);
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  setTokenCookie,
};
