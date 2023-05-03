import express, { Request, Response } from 'express';
import Post, { validatePost } from '../models/post';
import { authenticateToken } from '../middleware/auth';
import { IAuthRequest } from '../definitions';

const router = express.Router();

// CREATE POST
router.post('/posts', authenticateToken, async (req: IAuthRequest, res: Response) => {
	try {
		const { error, value } = validatePost(req.body, req.user._id);
		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const { title, description, author } = value;

		const post = new Post({
			title,
			description,
			author,
		});
		await post.save();

		return res.status(201).json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// VIEW POSTS
router.get('/posts', authenticateToken, async (_req: Request, res: Response) => {
	try {
		const posts = await Post.find();

		return res.status(200).json(posts);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// VIEW POST DETAILS
router.get('/post/:id', authenticateToken, async (req: Request, res: Response) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		return res.status(200).json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

export default router;
