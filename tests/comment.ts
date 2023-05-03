// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import app from '../app';
// import User, { IUser } from '../models/user';
// import Comment from '../models/comment';
// import Post, { IPost } from '../models/post';
// import mongoose from "mongoose";

// chai.use(chaiHttp);
// const expect = chai.expect;

// describe('Comment API', () => {
// 	let token: string;
// 	let user: IUser;
// 	let post: IPost;

// 	before(async () => {
// 		// create a test user and generate token for authentication
// 		user = {
// 			email: 'testuser@example.com',
// 			password: 'password',
// 			firstName: 'Test',
// 			lastName: 'User',
// 		} as IUser;
// 		let res = await chai.request(app)
// 			.post('/user')
// 			.send(user);
// 		user._id = res.body._id;
// 		res = await chai.request(app)
// 			.post('/login')
// 			.send({ email: user.email, password: user.password, });
// 		token = res.body.token;

// 		// Create a post
// 		const postRes = await chai.request(app)
// 			.post('/posts')
// 			.set('Authorization', `Bearer ${token}`)
// 			.send({
// 				title: 'Test Post',
// 				description: 'This is a test post'
// 			});
// 		post = postRes.body;
// 	});

// 	after(async () => {
// 		// delete the test user and its associated posts
// 		await Post.deleteMany({ author: user._id });
// 		await User.findByIdAndDelete(user._id);
// 	});

// 	describe('POST /comments/:postId', () => {
// 		it('should create a new comment and return the updated post', async () => {
// 			const commentData = {
// 				text: 'This is a comment',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post(`/comments/${post._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(commentData);

// 			expect(res).to.have.status(201);
// 			expect(res.body).to.have.property('_id');
// 			expect(res.body.comments).to.have.lengthOf(1);
// 			expect(res.body.comments[0]).to.have.property('text', 'This is a comment');

// 			post = res.body;
// 		});

// 		it('should return 400 if comment data is invalid', async () => {
// 			const commentData = {
// 				text: '',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post(`/comments/${post._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(commentData);

// 			expect(res).to.have.status(400);
// 			// expect(res.body.message).to.equal('Comment not found');
// 		});

// 		it('should return an 404 if post does not exist', async () => {
// 			const commentData = {
// 				text: 'This is a comment',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post(`/comments/${new mongoose.Types.ObjectId()}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(commentData);

// 			expect(res).to.have.status(404);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.message).to.equal('Post not found');
// 		});

// 		it('should return 401 if no token is provided', async () => {
// 			const commentData = {
// 				text: 'This is a comment',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post(`/comments/${post._id}`)
// 				.send(commentData);

// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('No token, authorization denied');
// 		});
// 	});

// 	describe('PATCH /comments/:postId/:commentId', () => {
// 		it('should update the text of a comment', async () => {
// 			const res = await chai
// 				.request(app)
// 				.patch(`/comments/${post._id}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });

// 			expect(res).to.have.status(201);
// 			expect(res.body).to.have.property('_id');
// 			expect(res.body.comments).to.have.lengthOf(1);
// 			expect(res.body.comments[0].text).to.equal('Updated test comment');
// 		});

// 		it('should return a 404 error if the post does not exist', async () => {
// 			const res = await chai
// 				.request(app)
// 				.patch(`/comments/${new mongoose.Types.ObjectId()}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(404);
// 			expect(res.body.message).to.equal('Post not found');
// 		});

// 		it('should return a 404 error if the comment does not exist', async () => {
// 			const res = await chai.request(app)
// 				.patch(`/comments/${post._id}/${new mongoose.Types.ObjectId()}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });

// 			expect(res).to.have.status(404);
// 			expect(res.body.message).to.equal('Comment not found');
// 		});

// 		it('should return a 401 error if the user is not the author of the comment', async () => {
// 			const otherUser = {
// 				email: 'testuser2@test.com',
// 				password: 'testpass2',
// 				firstName: 'Test',
// 				lastName: 'User2',
// 			} as IUser;
// 			let resp = await chai
// 				.request(app)
// 				.post('/user')
// 				.send(otherUser);
// 			user._id = resp.body._id;
// 			resp = await chai
// 				.request(app)
// 				.post('/login')
// 				.send({ email: otherUser.email, password: otherUser.password, });
// 			const otherUserToken = resp.body.token;

// 			const res = await chai
// 				.request(app)
// 				.patch(`/comments/${post._id}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${otherUserToken}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('Unauthorized');
// 			await User.findByIdAndDelete(otherUser._id);
// 		});
// 	});

// 	describe('DELETE /comments/:postId/:commentId', () => {
// 		it('should return a 404 error if the post does not exist', async () => {
// 			const res = await chai
// 				.request(app)
// 				.delete(`/comments/${new mongoose.Types.ObjectId()}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(404);
// 			expect(res.body.message).to.equal('Post not found');
// 		});

// 		it('should return a 404 error if the comment does not exist', async () => {
// 			const res = await chai.request(app)
// 				.delete(`/comments/${post._id}/${new mongoose.Types.ObjectId()}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(404);
// 			expect(res.body.message).to.equal('Comment not found');
// 		});

// 		it('should return a 401 error if the user is not the author of the comment', async () => {
// 			const otherUser = {
// 				email: 'testuser2@test.com',
// 				password: 'testpass2',
// 				firstName: 'Test',
// 				lastName: 'User2',
// 			} as IUser;
// 			let resp = await chai
// 				.request(app)
// 				.post('/user')
// 				.send(otherUser);
// 			user._id = resp.body._id;
// 			resp = await chai
// 				.request(app)
// 				.post('/login')
// 				.send({ email: otherUser.email, password: otherUser.password, });
// 			const otherUserToken = resp.body.token;

// 			const res = await chai
// 				.request(app)
// 				.delete(`/comments/${post._id}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${otherUserToken}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('Unauthorized');
// 			await User.findByIdAndDelete(otherUser._id);
// 		});

// 		it('should delete the comment if it exists and the user is the owner of it', async () => {
// 			const res = await chai
// 				.request(app)
// 				.delete(`/comments/${post._id}/${post.comments[0]._id}`)
// 				.set('Authorization', `Bearer ${token}`)
// 				.send({ text: 'Updated test comment' });
// 			expect(res).to.have.status(201);
// 			expect(res.body.comments).to.have.lengthOf(0);
// 			const deletedComment = await Comment.findById(post.comments[0]._id);
// 			expect(deletedComment).to.be.null;
// 		});
// 	});
// });
