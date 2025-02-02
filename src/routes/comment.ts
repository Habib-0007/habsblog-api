import express, { Request, Response } from 'express';
import Comment from '../models/Comment';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/', isAuthenticated, async (req: any, res: Response): Promise<void> => {
	try {
		const { content, postId } = req.body;
		const newComment = new Comment({
			content,
			author: req.user!.id,
			post: postId,
		});
		await newComment.save();
		res
			.status(201)
			.json({ message: 'Comment created successfully', comment: newComment });
		return
	} catch (error) {
		res.status(500).json({ message: 'Error creating comment' });
		return
	}
});

router.get('/post/:postId', async (req: Request, res: Response): Promise<void> => {
	try {
		const comments = await Comment.find({ post: req.params.postId })
			.sort({ createdAt: -1 })
			.populate('author', 'username');
		res.json(comments);
		return
	} catch (error) {
		res.status(500).json({ message: 'Error fetching comments' });
		return
	}
});

router.put('/:id', isAuthenticated, async (req: any, res: Response): Promise<void> => {
	try {
		const { content } = req.body;
		const comment = await Comment.findById(req.params.id);
		if (!comment) {
			res.status(404).json({ message: 'Comment not found' });
			return
		}
		if (comment.author.toString() !== req.user!.id) {
			res
				.status(403)
				.json({ message: 'Not authorized to update this comment' });
			return;
		}
		comment.content = content || comment.content;
		await comment.save();
		res.json({ message: 'Comment updated successfully', comment });
		return
	} catch (error) {
		res.status(500).json({ message: 'Error updating comment' });
		return
	}
});

router.delete('/:id', isAuthenticated, async (req: any, res: Response): Promise<void> => {
	try {
		const comment = await Comment.findById(req.params.id);
		if (!comment) {
			res.status(404).json({ message: 'Comment not found' });
			return
		}
		if (comment.author.toString() !== req.user!.id) {
			res
				.status(403)
				.json({ message: 'Not authorized to delete this comment' });
			return
		}
		await comment.deleteOne();
		res.json({ message: 'Comment deleted successfully' });
		return
	} catch (error) {
		res.status(500).json({ message: 'Error deleting comment' });
		return
	}
});

export default router;
