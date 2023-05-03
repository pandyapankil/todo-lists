import express, { Request, Response } from 'express';
import Post from '../models/post';
import { authenticateToken } from '../middleware/auth';
import { IAuthRequest } from '../definitions';
import Comment, { validateComment } from '../models/comment';

const router = express.Router();

// CREATE COMMENT
router.post('/comments/:postId', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const postId = req.params.postId;
	const userId = req.user._id;

	try {
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		const { error, value } = validateComment(req.body, userId);
		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const { text, author } = value;
		const comment = new Comment({
			text,
			author,
		});

		post.comments.push(comment);
		await post.save();
		return res.status(201).json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// UPDATE COMMENT
router.patch('/comments/:postId/:commentId', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const postId = req.params.postId;
	const commentId = req.params.commentId;
	const userId = req.user._id;

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		const comment = post.comments.find(comment => comment.id === commentId);

		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		// Check if the user is the author of the comment
		if (comment.author.toString() !== userId.toString()) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		comment.text = req.body.text;
		await post.save();
		return res.status(201).json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// DELETE COMMENT
router.delete('/comments/:postId/:commentId', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const postId = req.params.postId;
	const commentId = req.params.commentId;
	const userId = req.user._id;

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		const comment = post.comments.find(comment => comment.id === commentId);

		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		// Check if the user is the author of the comment
		if (comment.author.toString() !== userId.toString()) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		post.comments = post.comments.filter(comment => comment.id !== commentId);
		await post.save();
		return res.status(201).json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

export default router;
