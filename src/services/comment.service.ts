import Comment, { IComment } from '../models/Comment';
import Post from '../models/Post';
import { uploadImage, deleteImage } from '../config/fileupload.config';
import { AppError } from '../middlewares/errorhandler.middleware';
import {
  CreateCommentInput,
  UpdateCommentInput,
  CommentFilters,
} from '../types/comment.types';
import mongoose from 'mongoose';

export const createComment = async (
  userId: string,
  commentData: CreateCommentInput,
): Promise<IComment> => {
  const { content, postId, parentId, images = [] } = commentData;

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      throw new AppError('Parent comment not found', 404);
    }

    if (parentComment.post.toString() !== postId) {
      throw new AppError('Parent comment does not belong to this post', 400);
    }
  }

  const uploadedImages: string[] = [];
  const imagePublicIds: string[] = [];

  if (images && images.length > 0) {
    try {
      for (const image of images) {
        const uploadResult = await uploadImage(image, 'comments/images');
        uploadedImages.push(uploadResult.secure_url);
        imagePublicIds.push(uploadResult.public_id);
      }
    } catch (error) {
      for (const publicId of imagePublicIds) {
        await deleteImage(publicId);
      }
      throw new AppError('Image upload failed', 500);
    }
  }

  const comment = await Comment.create({
    content,
    post: postId,
    author: userId,
    parent: parentId,
    images: uploadedImages,
    imagePublicIds,
  });

  return comment;
};

export const getComments = async (filters: CommentFilters) => {
  const { postId, parentId, page = 1, limit = 10 } = filters;

  const query: any = {
    post: postId,
  };

  if (parentId) {
    query.parent = parentId;
  } else {
    query.parent = { $exists: false };
  }

  const skip = (page - 1) * limit;

  const comments = await Comment.find(query)
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments(query);

  const totalPages = Math.ceil(total / limit);

  return {
    comments,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults: total,
    },
  };
};

export const getCommentById = async (commentId: string): Promise<IComment> => {
  const comment = await Comment.findById(commentId)
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name avatar',
      },
    });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  return comment;
};

export const updateComment = async (
  commentId: string,
  userId: string,
  updateData: UpdateCommentInput,
  isAdmin: boolean = false,
): Promise<IComment> => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to update this comment', 403);
  }

  if (updateData.images && updateData.images.length > 0) {
    if (comment.imagePublicIds && comment.imagePublicIds.length > 0) {
      for (const publicId of comment.imagePublicIds) {
        await deleteImage(publicId);
      }
    }

    const uploadedImages: string[] = [];
    const imagePublicIds: string[] = [];

    try {
      for (const image of updateData.images) {
        const uploadResult = await uploadImage(image, 'comments/images');
        uploadedImages.push(uploadResult.secure_url);
        imagePublicIds.push(uploadResult.public_id);
      }

      comment.images = uploadedImages;
      comment.imagePublicIds = imagePublicIds;
    } catch (error) {
      for (const publicId of imagePublicIds) {
        await deleteImage(publicId);
      }
      throw new AppError('Image upload failed', 500);
    }
  }

  if (updateData.content) {
    comment.content = updateData.content;
    comment.isEdited = true;
  }

  await comment.save();

  return comment;
};

export const deleteComment = async (
  commentId: string,
  userId: string,
  isAdmin: boolean = false,
): Promise<void> => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  if (comment.imagePublicIds && comment.imagePublicIds.length > 0) {
    for (const publicId of comment.imagePublicIds) {
      await deleteImage(publicId);
    }
  }

  await comment.deleteOne();

  await Comment.deleteMany({ parent: commentId });
};

export const toggleLikeComment = async (
  commentId: string,
  userId: mongoose.Types.ObjectId,
): Promise<{ liked: boolean; likeCount: number }> => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const alreadyLiked = comment.likedBy.includes(userId);

  if (alreadyLiked) {
    comment.likedBy = comment.likedBy.filter((id) => id != userId);
    comment.likeCount = comment.likedBy.length;
    await comment.save();
    return { liked: false, likeCount: comment.likeCount };
  } else {
    comment.likedBy.push(userId);
    comment.likeCount = comment.likedBy.length;
    await comment.save();
    return { liked: true, likeCount: comment.likeCount };
  }
};
