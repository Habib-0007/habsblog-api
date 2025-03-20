import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asynchandler.utils';
import { AppError } from '../middlewares/errorhandler.middleware';
import * as commentService from '../services/comment.service';

export const createComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content, postId, parentId } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map(
        (file) =>
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      );
    }

    const comment = await commentService.createComment(req.user._id, {
      content,
      postId,
      parentId,
      images,
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  },
);

export const getComments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, parentId, page, limit } = req.query;

    if (!postId) {
      return next(new AppError('Post ID is required', 400));
    }

    const result = await commentService.getComments({
      postId: postId as string,
      parentId: parentId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.comments,
      count: result.comments.length,
      pagination: result.pagination,
    });
  },
);

export const getComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await commentService.getCommentById(req.params.id);

    res.status(200).json({
      success: true,
      data: comment,
    });
  },
);

export const updateComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map(
        (file) =>
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      );
    }

    const comment = await commentService.updateComment(
      req.params.id,
      req.user._id,
      {
        content,
        images: images.length > 0 ? images : undefined,
      },
      req.user.role === 'admin',
    );

    res.status(200).json({
      success: true,
      data: comment,
    });
  },
);

export const deleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await commentService.deleteComment(
      req.params.id,
      req.user._id,
      req.user.role === 'admin',
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  },
);

export const toggleLikeComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await commentService.toggleLikeComment(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);
