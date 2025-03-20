import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asynchandler.utils';
import { AppError } from '../middlewares/errorhandler.middleware';
import * as authService from '../services/auth.service';
import * as emailService from '../services/email.service';
import jwtUtils from '../utils/jwt.utils';
import User, { IUser } from '../models/User';

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, avatar } = req.body;

    const user = await authService.registerUser({
      name,
      email,
      password,
      avatar,
    });

    const { token, refreshToken } = await authService.generateAuthTokens(user);

    jwtUtils.setTokenCookie(res, token);

    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Welcome email error:', error);
    }

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await authService.loginUser({ email, password });

    const { token, refreshToken } = await authService.generateAuthTokens(user);

    jwtUtils.setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  },
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    await authService.logout(req.user._id, refreshToken);

    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  },
);

export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, bio, avatar } = req.body;

    const user = await authService.updateProfile(req.user._id, {
      name,
      email,
      bio,
      avatar,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  },
);

export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    await authService.updatePassword(req.user._id, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const resetToken = await authService.forgotPassword(email);

    const user: IUser | any = await User.findOne({ email });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(email, resetUrl, user.name);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      console.error('Reset email error:', error);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Email could not be sent', 500));
    }
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    await authService.resetPassword(resetToken, { password });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    jwtUtils.setTokenCookie(res, newAccessToken);

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  },
);
