import { Document, Model, model, Schema } from 'mongoose';
import Joi from 'joi';

export interface IUser extends Document {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	avatar: string;
	date: Date;
}

const userSchema: Schema<IUser> = new Schema({
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	avatar: { type: String, required: false },
	date: { type: Date, default: Date.now },
});

const User: Model<IUser> = model('User', userSchema);

export const validateUser = (user: IUser): Joi.ValidationResult => {
	const schema = Joi.object({
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		avatar: Joi.string().allow(null, ''),
		date: Joi.date().default(Date.now()),
	});
	return schema.validate(user) as Joi.ValidationResult;
};

export default User;
