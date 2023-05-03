// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import User from '../models/user';
// import server from '../app';

// chai.use(chaiHttp);
// const expect = chai.expect;

// describe('User API', () => {
// 	before(async () => {
// 		// Clear the user collection before running the tests
// 		await User.deleteMany({});
// 	});

// 	describe('POST /user', () => {
// 		it('should create a new user', async () => {
// 			const user = {
// 				email: 'testuser@example.com',
// 				password: 'password',
// 				firstName: 'Test',
// 				lastName: 'User',
// 			};

// 			const res = await chai.request(server)
// 				.post('/user')
// 				.send(user);

// 			expect(res).to.have.status(201);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.email).to.equal(user.email);

// 			// Verify that the user was saved to the database
// 			const savedUser = await User.findOne({ email: user.email });
// 			expect(savedUser).to.exist;
// 			expect(savedUser?.firstName).to.equal(user.firstName);
// 			expect(savedUser?.lastName).to.equal(user.lastName);
// 		});

// 		it('should return an error if the user already exists', async () => {
// 			const user = {
// 				email: 'testuser@example.com',
// 				password: 'password',
// 				firstName: 'Test',
// 				lastName: 'User',
// 			};

// 			const res = await chai.request(server)
// 				.post('/user')
// 				.send(user);

// 			expect(res).to.have.status(400);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.message).to.equal('User already exists');
// 		});
// 	});

// 	describe('POST /login', () => {
// 		it('should log in a user with valid credentials', async () => {
// 			const user = {
// 				email: 'testuser@example.com',
// 				password: 'password',
// 			};

// 			const res = await chai.request(server)
// 				.post('/login')
// 				.send(user);

// 			expect(res).to.have.status(200);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.token).to.be.a('string');
// 		});

// 		it('should return an error with invalid credentials', async () => {
// 			const user = {
// 				email: 'testuser@example.com',
// 				password: 'wrongpassword',
// 			};

// 			const res = await chai.request(server)
// 				.post('/login')
// 				.send(user);

// 			expect(res).to.have.status(401);
// 			expect(res.body).to.be.an('object');
// 			expect(res.body.message).to.equal('Invalid credentials');
// 		});
// 	});
// });
