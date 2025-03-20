import User, { IUser } from '../models/User';
import Post, { IPost } from '../models/Post';
import Comment, { IComment } from '../models/Comment';
import { AppError } from '../middlewares/errorhandler.middleware';

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults: total,
    },
  };
};

export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments();

  const totalPages = Math.ceil(total / limit);

  return {
    posts,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults: total,
    },
  };
};

export const getAllComments = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const comments = await Comment.find()
    .populate('author', 'name email')
    .populate('post', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments();

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

export const updateUserRole = async (
  userId: string,
  role: 'user' | 'admin',
): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = role;
  await user.save();

  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const posts = await Post.find({ author: userId });
  for (const post of posts) {
    if (post.coverImagePublicId) {
      const { deleteImage } = require('../config/cloudinary');
      await deleteImage(post.coverImagePublicId);
    }
    await post.deleteOne();
  }

  const comments = await Comment.find({ author: userId });
  for (const comment of comments) {
    if (comment.imagePublicIds && comment.imagePublicIds.length > 0) {
      const { deleteImage } = require('../config/cloudinary');
      for (const publicId of comment.imagePublicIds) {
        await deleteImage(publicId);
      }
    }
    await comment.deleteOne();
  }

  if (user.avatarPublicId) {
    const { deleteImage } = require('../config/cloudinary');
    await deleteImage(user.avatarPublicId);
  }

  await user.deleteOne();
};

export const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments();
  const publishedPosts = await Post.countDocuments({ status: 'published' });
  const draftPosts = await Post.countDocuments({ status: 'draft' });
  const totalComments = await Comment.countDocuments();

  const recentUsers = await User.find()
    .select('name email avatar createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentPosts = await Post.find()
    .select('title slug status viewCount likeCount createdAt')
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const popularPosts = await Post.find({ status: 'published' })
    .select('title slug viewCount likeCount createdAt')
    .populate('author', 'name')
    .sort({ viewCount: -1, likeCount: -1 })
    .limit(5);

  return {
    stats: {
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
    },
    recentUsers,
    recentPosts,
    popularPosts,
  };
};
