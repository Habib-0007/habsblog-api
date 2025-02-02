import express, { Express, Request, Response } from 'express';
import Post from '../models/Post';
import { isAuthenticated } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import MarkdownIt from 'markdown-it';

const router = express.Router();
const md = new MarkdownIt();

router.post(
  '/',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { title, content } = req.body;
      const images = req.files as Express.Multer.File[];

      const imageUrls = await Promise.all(
        images.map((file) => uploadToCloudinary(file.buffer)),
      );

      const newPost = new Post({
        title,
        content: md.render(content),
        author: req.user!.id,
        images: imageUrls.map((result) => result.secure_url),
      });

      await newPost.save();
      res
        .status(201)
        .json({ message: 'Post created successfully', post: newPost });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error creating post' });
      return;
    }
  },
);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(posts);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
    return;
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username',
    );
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json(post);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
    return;
  }
});

router.put(
  '/:id',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { title, content } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      if (post.author.toString() !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this post' });
        return;
      }
      post.title = title || post.title;
      post.content = md.render(content) || post.content;
      await post.save();
      res.json({ message: 'Post updated successfully', post });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error updating post' });
      return;
    }
  },
);

router.delete(
  '/:id',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      if (post.author.toString() !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to delete this post' });
        return;
      }
      await post.deleteOne();
      res.json({ message: 'Post deleted successfully' });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post' });
      return;
    }
  },
);

export default router;
