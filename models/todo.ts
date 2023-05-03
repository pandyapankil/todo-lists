import { Document, Model, model, Schema } from 'mongoose';
import { IUser } from './user';
import Joi from 'joi';

export interface ITodo extends Document {
	title: string;
	description?: string;
	status: string;
	owner: IUser['_id'];
}

const todoSchema: Schema<ITodo> = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: false },
	status: { type: String, default: 'Incomplete' },
	owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Todo: Model<ITodo> = model('Todo', todoSchema);

export const validateTodo = (todoWithoutOwner: Omit<ITodo, 'owner'>, owner: string): Joi.ValidationResult => {
	const schema = Joi.object({
		title: Joi.string().required(),
		description: Joi.string().optional(),
		status: Joi.string().optional().valid('Incomplete', 'Working', 'Complete').default('Incomplete'),
		owner: Joi.string().required(),
	});
	const todo: ITodo = Object.assign({}, todoWithoutOwner, { owner: owner.toString() });
	return schema.validate(todo) as Joi.ValidationResult;
};

export default Todo;
