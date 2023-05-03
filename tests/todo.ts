import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import { IUser } from '../models/user';
import { ITodo } from '../models/todo';
import mongoose from "mongoose";
import User from '../models/user';
import Todo from '../models/todo';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Todo API', () => {
	let token: string;
	let user: IUser;
	let todo: ITodo;

	before(async () => {
		// create a test user and generate token for authentication
		user = {
			email: 'testuser@example.com',
			password: 'password',
			firstName: 'Test',
			lastName: 'User',
		} as IUser;
		let res = await chai.request(app)
			.post('/user')
			.send(user);
		user._id = res.body._id;
		res = await chai.request(app)
			.post('/login')
			.send({ email: user.email, password: user.password, });
		token = res.body.token;
	});

	after(async () => {
		// delete the test user and its associated todos
		await Todo.deleteMany({ owner: user._id });
		await User.findByIdAndDelete(user._id);
	});

	describe('POST /todo', () => {
		it('should create a new todo', async () => {
			const todoData = { title: 'Test Todo', description: 'This is a test todo' };
			const res = await chai.request(app)
				.post('/todo')
				.set('Authorization', `Bearer ${token}`)
				.send(todoData);

			expect(res.status).to.equal(201);
			expect(res.body).to.have.property('_id');
			expect(res.body.title).to.equal(todoData.title);
			expect(res.body.description).to.equal(todoData.description);
			expect(res.body.owner).to.equal(user._id);

			todo = res.body;
		});

		it('should return error if authentication token is missing', async () => {
			const todoData = { title: 'Test Todo', description: 'This is a test todo' };
			const res = await chai.request(app)
				.post('/todo')
				.send(todoData);

			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal('No token, authorization denied');
		});

		it('should return an error if required fields are missing', async () => {
			const todoData = { description: 'Test description' };

			const res = await chai
				.request(app)
				.post('/todo')
				.set('Authorization', `Bearer ${token}`)
				.send(todoData);

			expect(res).to.have.status(400);
			expect(res.body).to.be.an('object');
			expect(res.body.message).to.equal('"title" is required');
		});
	});

	describe('GET /todos', () => {
		it('should return all todos', async () => {
			const res = await chai.request(app)
				.get('/todos')
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
			expect(res.body).to.have.lengthOf(1);
			expect(res.body[0]).to.have.property('_id');
			expect(res.body[0].title).to.equal(todo.title);
			expect(res.body[0].description).to.equal(todo.description);
			expect(res.body[0].owner).to.equal(user._id);
		});

		it('should return error if authentication token is missing', async () => {
			const res = await chai.request(app)
				.get('/todos');

			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal('No token, authorization denied');
		});
	});

	describe('GET /todo/:id', () => {
		it('should return a todo by ID', async () => {
			const res = await chai.request(app)
				.get(`/todo/${todo._id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('_id');
			expect(res.body.title).to.equal(todo.title);
			expect(res.body.description).to.equal(todo.description);
			expect(res.body.owner).to.equal(user._id);
		});

		it('should return 404 if todo does not exist', async () => {
			const res = await chai
				.request(app)
				.get(`/todo/${new mongoose.Types.ObjectId()}`)
				.set('Authorization', `Bearer ${token}`);

			expect(res).to.have.status(404);
			expect(res.body).to.be.an('object');
			expect(res.body.message).to.equal('Todo not found');
		});

		it('should return error if authentication token is missing', async () => {
			const res = await chai.request(app)
				.get(`/todo/${new mongoose.Types.ObjectId()}`);

			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal('No token, authorization denied');
		});
	});

	describe('PUT /todo/:id', () => {
		it('should update the todo', async () => {
			const res = await chai.request(app)
				.put(`/todo/${todo._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Updated Test Todo',
					description: 'Updated Test Todo Description',
				});
			expect(res.status).to.equal(200);
			expect(res.body.title).to.equal('Updated Test Todo');
			expect(res.body.description).to.equal('Updated Test Todo Description');
		});

		it('should return 404 if the todo is not found', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await chai.request(app)
				.put(`/todo/${fakeId}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Updated Test Todo',
					description: 'Updated Test Todo Description',
					status: 'Complete'
				});
			expect(res.status).to.equal(404);
			expect(res.body.message).to.equal('Todo not found');
		});

		it('should return 401 if the user is not the owner of the todo', async () => {
			const user2 = {
				email: 'testuser2@test.com',
				password: 'testpass2',
				firstName: 'Test',
				lastName: 'User2',
			} as IUser;
			let resp = await chai.request(app)
				.post('/user')
				.send(user2);
			user._id = resp.body._id;
			resp = await chai.request(app)
				.post('/login')
				.send({ email: user2.email, password: user2.password, });
			const user2Token = resp.body.token;

			const res = await chai.request(app)
				.put(`/todo/${todo._id}`)
				.set('Authorization', `Bearer ${user2Token}`)
				.send({
					title: 'Updated Test Todo',
					description: 'Updated Test Todo Description',
					status: 'Complete'
				});
			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal('Unauthorized');
			await User.findByIdAndDelete(user2._id);
		});
	});

	describe('PATCH /todo/:id/complete', () => {
		it('should mark the todo as complete', async () => {
			const res = await chai.request(app)
				.patch(`/todo/${todo._id}/complete`)
				.set('Authorization', `Bearer ${token}`);

			expect(res).to.have.status(200);
			expect(res.body).to.have.property('status', 'Complete');

			// Check if the todo is marked as complete in the database
			const updatedTodo = await Todo.findById(todo._id);
			expect(updatedTodo).to.have.property('status', 'Complete');
		});

		it('should return 404 if the todo is not found', async () => {
			const res = await chai.request(app)
				.patch(`/todo/${new mongoose.Types.ObjectId()}/complete`)
				.set('Authorization', `Bearer ${token}`);

			expect(res).to.have.status(404);
			expect(res.body).to.have.property('message', 'Todo not found');
		});

		it('should return 401 if the user is not the owner of the todo', async () => {
			// Create another user and todo
			const otherUser = await User.create({
				firstName: 'Other',
				lastName: 'User',
				email: 'other@example.com',
				password: 'testpassword'
			});
			const otherTodo = await Todo.create({
				title: 'Other Todo',
				owner: otherUser._id
			});

			const res = await chai.request(app)
				.patch(`/todo/${otherTodo._id}/complete`)
				.set('Authorization', `Bearer ${token}`);

			expect(res).to.have.status(401);
			expect(res.body).to.have.property('message', 'Unauthorized');

			// Remove the other test data
			await Todo.findByIdAndDelete(otherTodo._id);
			await User.findByIdAndDelete(otherUser._id);
		});
	});

	describe('DELETE /todo/:id', () => {
		it('should return 404 if the todo does not exist', async () => {
			const res = await chai.request(app)
				.delete(`/todo/${new mongoose.Types.ObjectId()}`)
				.set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(404);
			expect(res.body.message).to.equal('Todo not found');
		});

		it('should return 401 if the user is not the owner of the todo', async () => {
			const newTodo = await Todo.create({
				title: 'New Todo',
				description: 'New Todo Description',
				owner: new mongoose.Types.ObjectId(),
			});
			const res = await chai.request(app)
				.delete(`/todo/${newTodo._id}`)
				.set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(401);
			expect(res.body.message).to.equal('Unauthorized');
			await Todo.findByIdAndDelete(newTodo._id);
		});

		it('should delete the todo if it exists and the user is the owner of the todo', async () => {
			const res = await chai.request(app)
				.delete(`/todo/${todo._id}`)
				.set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(200);
			expect(res.body.message).to.equal('Todo deleted');
			const deletedTodo = await Todo.findById(todo._id);
			expect(deletedTodo).to.be.null;
		});
	});
});
