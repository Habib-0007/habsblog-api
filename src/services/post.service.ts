import Post, { IPost } from '../models/Post';
import { uploadImage, deleteImage } from '../config/fileupload.config';
import { AppError } from '../middlewares/errorhandler.middleware';
import {
  CreatePostInput,
  UpdatePostInput,
  PostFilters,
} from '../types/post.types';
import { markdownToPlainText } from './markdown.service';
import mongoose from 'mongoose';

export const createPost = async (
  userId: string,
  postData: CreatePostInput,
): Promise<IPost> => {
  const { title, content, excerpt, coverImage, tags, status } = postData;

  let coverImageUrl = undefined;
  let coverImagePublicId = undefined;

  if (coverImage) {
    try {
      const uploadResult = await uploadImage(coverImage, 'posts/covers');
      coverImageUrl = uploadResult.secure_url;
      coverImagePublicId = uploadResult.public_id;
    } catch (error) {
      throw new AppError('Cover image upload failed', 500);
    }
  }

  const generatedExcerpt = excerpt || await markdownToPlainText(content, 160);

  const post = await Post.create({
    title,
    content,
    excerpt: generatedExcerpt,
    coverImage: coverImageUrl,
    coverImagePublicId,
    author: userId,
    tags: tags || [],
    status: status || 'draft',
  });

  return post;
};

export const getPosts = async (filters: PostFilters = {}) => {
  const {
    search,
    tag,
    author,
    status = 'published',
    sortBy = 'newest',
    page = 1,
    limit = 10,
  } = filters;

  const query: any = {};

  query.status = status;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];
  }

  if (tag) {
    query.tags = tag;
  }

  if (author) {
    query.author = author;
  }

  const skip = (page - 1) * limit;

  let sort = {};
  switch (sortBy) {
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'popular':
      sort = { viewCount: -1, likeCount: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
  }

  const posts = await Post.find(query)
    .populate('author', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(query);

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

export const getPostById = async (idOrSlug: string): Promise<IPost> => {
  let post;

  const isValidId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  if (isValidId) {
    post = await Post.findById(idOrSlug);
  } else {
    post = await Post.findOne({ slug: idOrSlug });
  }

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  post.viewCount += 1;
  await post.save();

  return post;
};

export const updatePost = async (
  postId: string,
  userId: string,
  updateData: UpdatePostInput,
  isAdmin: boolean = false,
): Promise<IPost> => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() != userId && !isAdmin) {
    throw new AppError(
      `Not authorized to update this post ${post.author.toString()} ${userId}`,
      403,
    );
  }

  if (updateData.coverImage) {
    if (post.coverImagePublicId) {
      await deleteImage(post.coverImagePublicId);
    }

    const uploadResult = await uploadImage(
      updateData.coverImage,
      'posts/covers',
    );
    updateData.coverImage = uploadResult.secure_url;
    post.coverImagePublicId = uploadResult.public_id;
  }

  if (updateData.title) post.title = updateData.title;
  if (updateData.content) post.content = updateData.content;
  if (updateData.excerpt) post.excerpt = updateData.excerpt;
  if (updateData.coverImage) post.coverImage = updateData.coverImage;
  if (updateData.tags) post.tags = updateData.tags;
  if (updateData.status) post.status = updateData.status;

  await post.save();

  return post;
};

export const deletePost = async (
  postId: string,
  userId: string,
  isAdmin: boolean = false,
): Promise<void> => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() != userId && !isAdmin) {
    throw new AppError('Not authorized to delete this post', 403);
  }

  if (post.coverImagePublicId) {
    await deleteImage(post.coverImagePublicId);
  }

  await post.deleteOne();
};

export const toggleLikePost = async (
  postId: string,
  userId: mongoose.Types.ObjectId,
): Promise<{ liked: boolean; likeCount: number }> => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const alreadyLiked = post.likedBy.includes(userId);

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => id != userId);
    post.likeCount = post.likedBy.length;
    await post.save();
    return { liked: false, likeCount: post.likeCount };
  } else {
    post.likedBy.push(userId);
    post.likeCount = post.likedBy.length;
    await post.save();
    return { liked: true, likeCount: post.likeCount };
  }
};

export const getUserDrafts = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    author: userId,
    status: 'draft',
  })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments({
    author: userId,
    status: 'draft',
  });

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
