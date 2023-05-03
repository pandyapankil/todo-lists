import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { validateUser } from '../models/user';

const router = express.Router();

// CREATE USER
router.post('/user', async (req: Request, res: Response) => {
	try {
		const { error, value } = validateUser(req.body);
		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const { email, password, firstName, lastName, avatar } = value;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			email,
			password: hashedPassword,
			firstName,
			lastName,
			avatar,
		});

		await user.save();

		return res.status(201).json(user);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// LOGIN USER
router.post('/login', async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET as string);
		res.json({ token });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

export default router;
