import { Document, Model, model, Schema } from 'mongoose';
import { IUser } from './user';
import { IComment, commentSchema } from './comment';
import Joi from 'joi';

export interface IPost extends Document {
	title: string;
	description: string;
	author: IUser['_id'];
	comments: IComment[];
}

const PostSchema: Schema<IPost> = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	comments: [commentSchema],
});

const Post: Model<IPost> = model('Post', PostSchema);

export const validatePost = (postWithoutAuthor: Omit<IPost, 'author'>, author: string): Joi.ValidationResult => {
	const schema = Joi.object({
		title: Joi.string().required(),
		description: Joi.string().required(),
		author: Joi.string().required(),
		comments: Joi.array().optional().items(commentSchema.obj)
	});
	const post: IPost = Object.assign({}, postWithoutAuthor, { author: author.toString() });
	return schema.validate(post) as Joi.ValidationResult;
};

export default Post;
