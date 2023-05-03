import { Response, NextFunction } from 'express';
import { IAuthRequest } from "../definitions";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from "../models/user";

export const authenticateToken = async (req: IAuthRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers['authorization'];

		// Get token from header
		const token = authHeader && authHeader.split(' ')[1];

		// Check if token exists
		if (token == null) {
			return res.status(401).json({ message: 'No token, authorization denied' });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

		// Check if user exists
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ message: 'Token is not valid' });
		}

		// Set user in request object
		req.user = user;

		// Call next middleware
		next();
	} catch (err) {
		console.error((err as Error).message);
		res.status(500).json({ message: 'Server Error' });
	}
};
