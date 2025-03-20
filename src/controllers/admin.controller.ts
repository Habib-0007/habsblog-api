import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asynchandler.utils';
import { AppError } from '../middlewares/errorhandler.middleware';
import * as adminService from '../services/admin.service';

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    const result = await adminService.getAllUsers(
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
    );

    res.status(200).json({
      success: true,
      data: result.users,
      count: result.users.length,
      pagination: result.pagination,
    });
  },
);

export const getPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    const result = await adminService.getAllPosts(
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
    );

    res.status(200).json({
      success: true,
      data: result.posts,
      count: result.posts.length,
      pagination: result.pagination,
    });
  },
);

export const getComments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    const result = await adminService.getAllComments(
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
    );

    res.status(200).json({
      success: true,
      data: result.comments,
      count: result.comments.length,
      pagination: result.pagination,
    });
  },
);

export const updateUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await adminService.updateUserRole(
      req.params.id,
      role as 'user' | 'admin',
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await adminService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  },
);

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
);
