import type { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asynchandler.utils';
import { AppError } from '../middlewares/errorhandler.middleware';
import * as postService from '../services/post.service';
import * as markdownService from '../services/markdown.service';

export const createPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { title, content, excerpt, tags, status } = req.body;

    let coverImage = undefined;
    if (req.file) {
      coverImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const post = await postService.createPost(req.user._id, {
      title,
      content, // Content will be processed in the service
      excerpt,
      coverImage,
      tags: tags ? JSON.parse(tags) : undefined,
      status,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  },
);

export const getPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, tag, author, status, sortBy, page, limit } = req.query;

    const result = await postService.getPosts({
      search: search as string,
      tag: tag as string,
      author: author as string,
      status: status as 'draft' | 'published',
      sortBy: sortBy as 'newest' | 'oldest' | 'popular',
      page: page ? Number.parseInt(page as string) : undefined,
      limit: limit ? Number.parseInt(limit as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.posts,
      count: result.posts.length,
      pagination: result.pagination,
    });
  },
);

export const getPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await postService.getPostById(req.params.id);

    const htmlContent = await markdownService.markdownToHtml(post.content);

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
        htmlContent,
      },
    });
  },
);

export const updatePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { title, content, excerpt, tags, status } = req.body;

    let coverImage = undefined;
    if (req.file) {
      coverImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      {
        title,
        content, // Content will be processed in the service
        excerpt,
        coverImage,
        tags: tags ? JSON.parse(tags) : undefined,
        status,
      },
      req.user.role === 'admin',
    );

    res.status(200).json({
      success: true,
      data: post,
    });
  },
);

export const deletePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    await postService.deletePost(
      req.params.id,
      req.user._id,
      req.user.role === 'user',
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  },
);

export const toggleLikePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await postService.toggleLikePost(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getUserDrafts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { page, limit } = req.query;

    const result = await postService.getUserDrafts(
      req.user._id,
      page ? Number.parseInt(page as string) : undefined,
      limit ? Number.parseInt(limit as string) : undefined,
    );

    res.status(200).json({
      success: true,
      data: result.posts,
      count: result.posts.length,
      pagination: result.pagination,
    });
  },
);
