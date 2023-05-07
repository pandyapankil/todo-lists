import express, { Request, Response } from 'express';
import Todo, { validateTodo } from '../models/todo';
import { authenticateToken } from '../middleware/auth';
import { IAuthRequest } from '../definitions';

const router = express.Router();

// CREATE TODO
router.post('/todo', authenticateToken, async (req: IAuthRequest, res: Response) => {
	try {
		const { error, value } = validateTodo(req.body, req.user._id);
		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const { title, description, status, owner } = value;

		const todo = new Todo({
			title,
			description,
			status,
			owner,
		});

		await todo.save();

		return res.status(201).json(todo);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// VIEW TODOS
router.get('/todos', authenticateToken, async (_req: Request, res: Response) => {
	try {
		const todos = await Todo.find();

		return res.status(200).json(todos);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// VIEW TODO DETAILS
router.get('/todo/:id', authenticateToken, async (req: Request, res: Response) => {
	try {
		const todo = await Todo.findById(req.params.id);

		if (!todo) {
			return res.status(404).json({ message: 'Todo not found' });
		}

		return res.status(200).json(todo);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// UPDATE TODO
router.put('/todo/:id', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const todoId = req.params.id;
	const userId = req.user._id;

	try {
		const todo = await Todo.findById(todoId);
		if (!todo) {
			return res.status(404).json({ message: 'Todo not found' });
		}

		// Check if the user is the owner of the todo
		if (todo.owner.toString() !== userId.toString()) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		todo.title = req.body.title;
		todo.description = req.body.description;
		todo.status = req.body.status;
		await todo.save();

		return res.status(200).json(todo);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// MARK AS COMPLETE
router.patch('/todo/:id/complete', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const todoId = req.params.id;
	const userId = req.user._id;

	try {
		const todo = await Todo.findById(todoId);
		if (!todo) {
			return res.status(404).json({ message: 'Todo not found' });
		}

		// Check if the user is the owner of the todo
		if (todo.owner.toString() !== userId.toString()) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		todo.status = 'Complete';
		await todo.save();

		return res.status(200).json(todo);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// DELETE TODO
router.delete('/todo/:id', authenticateToken, async (req: IAuthRequest, res: Response) => {
	const todoId = req.params.id;
	const userId = req.user._id;

	try {
		const todo = await Todo.findById(todoId);
		if (!todo) {
			return res.status(404).json({ message: 'Todo not found' });
		}

		// Check if the user is the owner of the todo
		if (todo.owner.toString() !== userId.toString()) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		await Todo.findByIdAndDelete(todoId);

		return res.status(200).json({ message: 'Todo deleted' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

export default router;
