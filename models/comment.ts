import { Document, Model, model, Schema } from 'mongoose';
import { IUser } from './user';
import Joi from 'joi';

export interface IComment extends Document {
	text: string;
	author: IUser['_id'];
}

export const commentSchema: Schema<IComment> = new Schema({
	text: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Comment: Model<IComment> = model('Comment', commentSchema);

export const validateComment = (commentWithoutAuthor: Omit<IComment, 'author'>, author: string): Joi.ValidationResult => {
	const schema = Joi.object({
		text: Joi.string().required(),
		author: Joi.string().required(),
	});
	const comment: IComment = Object.assign({}, commentWithoutAuthor, { author: author.toString() });
	return schema.validate(comment) as Joi.ValidationResult;
};


export default Comment;
