import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import User, { IUser } from '../models/user';
import Comment from '../models/comment';
import Post, { IPost } from '../models/post';
import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Comment API', () => {
	let token: string;
	let user: IUser;
	let post: IPost;
	let otherUser: IUser;
	let otherUserToken: string;


	before(async () => {
		// create a test user and generate token for authentication
		const salt = await bcrypt.genSalt(10);
		user = new User({
			email: 'testuser@example.com',
			password: await bcrypt.hash('password', salt),
			firstName: 'Test',
			lastName: 'User',
		});
		await user.save();
		token = jwt.sign({
			id: user._id,
			email: user.email
		}, process.env.JWT_SECRET as string);

		// create a second test user and generate token for authentication
		otherUser = new User({
			email: 'testuser2@test.com',
			password: await bcrypt.hash('testpass2', salt),
			firstName: 'Test',
			lastName: 'User2',
		});
		await otherUser.save();
		otherUserToken = jwt.sign({
			id: otherUser._id,
			email: otherUser.email
		}, process.env.JWT_SECRET as string);

		// Create a post
		post = new Post({
			title: 'Test Post',
			description: 'This is a test post',
			author: new mongoose.Types.ObjectId(user._id),
		});
		await post.save();
	});

	after(async () => {
		// delete test users and its associated posts
		await Post.deleteMany({ author: user._id });
		await User.findByIdAndDelete(user._id);
		await User.findByIdAndDelete(otherUser._id);
	});

	describe('POST /comments/:postId', () => {
		it('should create a new comment and return the updated post', async () => {
			const commentData = {
				text: 'This is a comment',
			};

			const res = await chai
				.request(app)
				.post(`/comments/${post._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(commentData);

			expect(res).to.have.status(201);
			expect(res.body).to.have.property('_id');
			expect(res.body.comments).to.have.lengthOf(1);
			expect(res.body.comments[0]).to.have.property('text', 'This is a comment');

			post = res.body;
		});

		it('should return 400 if comment data is invalid', async () => {
			const commentData = {
				text: '',
			};

			const res = await chai
				.request(app)
				.post(`/comments/${post._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(commentData);

			expect(res).to.have.status(400);
			// expect(res.body.message).to.equal('Comment not found');
		});

		it('should return an 404 if post does not exist', async () => {
			const commentData = {
				text: 'This is a comment',
			};

			const res = await chai
				.request(app)
				.post(`/comments/${new mongoose.Types.ObjectId()}`)
				.set('Authorization', `Bearer ${token}`)
				.send(commentData);

			expect(res).to.have.status(404);
			expect(res.body).to.be.an('object');
			expect(res.body.message).to.equal('Post not found');
		});

		it('should return 401 if no token is provided', async () => {
			const commentData = {
				text: 'This is a comment',
			};

			const res = await chai
				.request(app)
				.post(`/comments/${post._id}`)
				.send(commentData);

			expect(res).to.have.status(401);
			expect(res.body.message).to.equal('No token, authorization denied');
		});
	});

	describe('PATCH /comments/:postId/:commentId', () => {
		it('should update the text of a comment', async () => {
			const res = await chai
				.request(app)
				.patch(`/comments/${post._id}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });

			expect(res).to.have.status(201);
			expect(res.body).to.have.property('_id');
			expect(res.body.comments).to.have.lengthOf(1);
			expect(res.body.comments[0].text).to.equal('Updated test comment');
		});

		it('should return a 404 error if the post does not exist', async () => {
			const res = await chai
				.request(app)
				.patch(`/comments/${new mongoose.Types.ObjectId()}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(404);
			expect(res.body.message).to.equal('Post not found');
		});

		it('should return a 404 error if the comment does not exist', async () => {
			const res = await chai.request(app)
				.patch(`/comments/${post._id}/${new mongoose.Types.ObjectId()}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });

			expect(res).to.have.status(404);
			expect(res.body.message).to.equal('Comment not found');
		});

		it('should return a 401 error if the user is not the author of the comment', async () => {
			const res = await chai
				.request(app)
				.patch(`/comments/${post._id}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${otherUserToken}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(401);
			expect(res.body.message).to.equal('Unauthorized');
		});
	});

	describe('DELETE /comments/:postId/:commentId', () => {
		it('should return a 404 error if the post does not exist', async () => {
			const res = await chai
				.request(app)
				.delete(`/comments/${new mongoose.Types.ObjectId()}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(404);
			expect(res.body.message).to.equal('Post not found');
		});

		it('should return a 404 error if the comment does not exist', async () => {
			const res = await chai.request(app)
				.delete(`/comments/${post._id}/${new mongoose.Types.ObjectId()}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(404);
			expect(res.body.message).to.equal('Comment not found');
		});

		it('should return a 401 error if the user is not the author of the comment', async () => {
			const res = await chai
				.request(app)
				.delete(`/comments/${post._id}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${otherUserToken}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(401);
			expect(res.body.message).to.equal('Unauthorized');
		});

		it('should delete the comment if it exists and the user is the owner of it', async () => {
			const res = await chai
				.request(app)
				.delete(`/comments/${post._id}/${post.comments[0]._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({ text: 'Updated test comment' });
			expect(res).to.have.status(201);
			expect(res.body.comments).to.have.lengthOf(0);
			const deletedComment = await Comment.findById(post.comments[0]._id);
			expect(deletedComment).to.be.null;
		});
	});
});
