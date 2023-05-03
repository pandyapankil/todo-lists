// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import app from '../app';
// import { IUser } from '../models/user';
// import User from '../models/user';
// import Post, { IPost } from '../models/post';
// import mongoose from "mongoose";

// chai.use(chaiHttp);
// const expect = chai.expect;

// describe('Post API', () => {
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
// 	});

// 	after(async () => {
// 		// delete the test user and its associated posts
// 		await Post.deleteMany({ owner: user._id });
// 		await User.findByIdAndDelete(user._id);
// 	});

// 	describe('POST /posts', () => {
// 		it('should create a new post', async () => {
// 			const postData = {
// 				title: 'My First Post',
// 				description: 'This is my first post',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post('/posts')
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(postData);

// 			expect(res).to.have.status(201);
// 			expect(res.body.title).to.equal(postData.title);
// 			expect(res.body.description).to.equal(postData.description);
// 			expect(res.body.author).to.exist;

// 			post = res.body;
// 		});

// 		it('should return 400 if title is not provided', async () => {
// 			const post = {
// 				description: 'This is my first post',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post('/posts')
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(post);

// 			expect(res).to.have.status(400);
// 			expect(res.body.message).to.equal('"title" is required');
// 		});

// 		it('should return 400 if description is not provided', async () => {
// 			const post = {
// 				title: 'My First Post',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post('/posts')
// 				.set('Authorization', `Bearer ${token}`)
// 				.send(post);

// 			expect(res).to.have.status(400);
// 			expect(res.body.message).to.equal('"description" is required');
// 		});

// 		it('should return error if authentication token is missing', async () => {
// 			const post = {
// 				title: 'My First Post',
// 				description: 'This is my first post',
// 			};

// 			const res = await chai
// 				.request(app)
// 				.post('/posts')
// 				.send(post);

// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('No token, authorization denied');
// 		});
// 	});

// 	describe('GET /posts', () => {
// 		it('should return all posts', async () => {
// 			const res = await chai
// 				.request(app)
// 				.get('/posts')
// 				.set('Authorization', `Bearer ${token}`);

// 			expect(res).to.have.status(200);
// 			expect(res.body).to.be.an('array');
// 			expect(res.body).to.have.lengthOf(1);
// 			expect(res.body[0]).to.have.property('_id');
// 			expect(res.body[0].title).to.equal(post.title);
// 			expect(res.body[0].description).to.equal(post.description);
// 			expect(res.body[0].owner).to.equal(user._id);
// 		});

// 		it('should return error if authentication token is missing', async () => {
// 			const res = await chai
// 				.request(app)
// 				.get('/posts');

// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('No token, authorization denied');
// 		});
// 	});

// 	describe('GET /post/:id', () => {
// 		it('should return post by ID', async () => {
// 			const res = await chai
// 				.request(app)
// 				.get(`/post/${post._id}`)
// 				.set('Authorization', `Bearer ${token}`);

// 			expect(res.status).to.equal(200);
// 			expect(res.body).to.have.property('_id');
// 			expect(res.body.title).to.equal(post.title);
// 			expect(res.body.description).to.equal(post.description);
// 			expect(res.body.owner).to.equal(user._id);
// 		});

// 		it('should return 404 if post does not exist', async () => {
// 			const res = await chai
// 				.request(app)
// 				.get(`/post/${new mongoose.Types.ObjectId()}`)
// 				.set('Authorization', `Bearer ${token}`);

// 			expect(res).to.have.status(404);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.message).to.equal('Post not found');
// 		});

// 		it('should return error if authentication token is missing', async () => {
// 			const res = await chai
// 				.request(app)
// 				.get(`/post/${post._id}`);

// 			expect(res).to.have.status(401);
// 			expect(res.body.message).to.equal('No token, authorization denied');
// 		});
// 	});
// });
