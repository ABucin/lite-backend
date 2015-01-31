/**
 * Created by ABucin on 28/12/2014.
 */

var superagent = require('superagent'),
	mongoose = require('mongoose'),
	expect = require('expect.js'),
	config = require('../config.json'),
	User = require('../src/model/user'),
	Settings = require('../src/model/settings'),
	Log = require('../src/model/log'),
	Ticket = require('../src/model/ticket'),
	Comment = require('../src/model/comment'),
	baseURL = "http://localhost:" + config.port + config.root + config.apiVersion,
	authHeader = 'Basic dGVzdDp0ZXN0',
	authHeader2 = 'Basic dGVzdDI6dGVzdDI=';

describe('Server tests', function () {
	mongoose.connect(config.dbURI);

	var key = '1',
		nonExistentKey = '999',
		db = mongoose.connection;

	db.once('open', function () {
		console.log('Connection to DB established...');
	});

	/**
	 * Populates the DB with relevant data before each test.
	 */
	beforeEach(function (done) {
		User.collection.drop();

		var log = new Log({key: '1', username: 'test', targetType: "targetType", target: "target", action: "action"}),
			settings = new Settings({key: '1', displayUserActivity: true, displayUserEmail: true}),
			settings2 = new Settings({key: '2', displayUserChart: true, displayUserRole: true}),
			comment = new Comment({key: '1', content: 'comment', ticket: '1', author: 'test'}),
			ticket = new Ticket({
				key: '1',
				code: '1',
				title: 'test ticket',
				status: 'open',
				type: 'bug',
				description: 'the test ticket',
				owner: 'test'
			}),
			ticket2 = new Ticket({
				key: '2',
				code: '2',
				title: 'test ticket2',
				status: 'closed',
				type: 'task',
				description: 'the test ticket2',
				owner: 'test2'
			});

		new User({
			key: '1',
			email: 'test@test.com',
			username: 'test',
			firstName: "John",
			lastName: "Doe",
			password: 'test',
			project: "testProject",
			logs: [log],
			settings: [settings],
			tickets: [ticket],
			comments: [comment]
		}).save(function (err) {
				if (err)
					return done(err);

				new User({
					key: '2',
					email: 'test2@test.com',
					username: 'test2',
					password: 'test2',
					project: "testProject2",
					logs: [],
					settings: [settings2],
					tickets: [ticket2],
					comments: []
				}).save(done);
			});
	});

	describe('Analytics resource tests', function () {

		it('should retrieve chart with specified type', function (done) {
			superagent.get(baseURL + '/analytics')
				.set('Authorization', authHeader)
				.query({type: 'effortEstimation'})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.chart.type).to.eql('scatter');

					done();
				});
		});
	});

	describe('Authentication resource tests', function () {

		it('should allow the user to register', function (done) {
			superagent.post(baseURL + '/auth/register')
				.set('Authorization', authHeader)
				.send({
					username: 'newUsername',
					email: 'email@test.com',
					firstName: 'firstName',
					lastName: 'lastName'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(201);
					expect(res.body.email).to.eql('email@test.com');
					expect(res.body.username).to.eql('newUsername');
					expect(res.body.firstName).to.eql('firstName');
					expect(res.body.lastName).to.eql('lastName');

					var newUserKey = res.body.key;

					User.findOne({
						key: newUserKey
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.email).to.eql('email@test.com');
						expect(user.username).to.eql('newUsername');
						expect(user.firstName).to.eql('firstName');
						expect(user.lastName).to.eql('lastName');
					});

					done();
				});
		});

		it('should allow existing user to login', function (done) {
			superagent.post(baseURL + '/auth/login')
				.set('Authorization', authHeader)
				.send({
					username: 'test'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.email).to.eql('test@test.com');
					expect(res.body.username).to.eql('test');
					expect(res.body.firstName).to.eql('John');
					expect(res.body.lastName).to.eql('Doe');

					done();
				});
		});

		it('should allow existing user to logout', function (done) {
			superagent.post(baseURL + '/auth/logout')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);

					done();
				});
		});

	});

	describe('Comment resource tests', function () {

		it('should retrieve comment with specified key', function (done) {
			superagent.get(baseURL + '/tickets/' + key + '/comments')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].ticket).to.eql('1');
					expect(res.body[0].content).to.eql('comment');
					expect(res.body[0].author).to.eql('test');
					done();
				});
		});

		it('should add a comment', function (done) {
			superagent.post(baseURL + '/tickets/' + key + '/comments')
				.set('Authorization', authHeader)
				.send({ticket: '1', content: 'comment2', author: 'test2'})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(201);
					expect(res.body.ticket).to.eql('1');
					expect(res.body.content).to.eql('comment2');
					expect(res.body.author).to.eql('test2');

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.comments[1].ticket).to.eql('1');
						expect(user.comments[1].content).to.eql('comment2');
						expect(user.comments[1].author).to.eql('test2');
					});

					done();
				});
		});

		it('should update the comment with the given key', function (done) {
			superagent.put(baseURL + '/comments/' + key)
				.set('Authorization', authHeader)
				.send({ticket: '1', content: 'updatedComment2', author: 'updatedTest2'})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.ticket).to.eql('1');
					expect(res.body.content).to.eql('updatedComment2');
					expect(res.body.isEdited).to.eql(true);
					expect(res.body.author).to.eql('test');

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.comments[0].ticket).to.eql('1');
						expect(user.comments[0].content).to.eql('updatedComment2');
						expect(user.comments[0].author).to.eql('test');
						expect(user.comments[0].isEdited).to.eql(true);
					});

					done();
				});
		});

		it('should delete the comment with the given key', function (done) {
			superagent.del(baseURL + '/comments/' + key)
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(res.status).to.eql(204);
					expect(res.body).to.be.an('object');
					expect(res.body).to.be.empty();

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.comments.length).to.be(0);
					});

					done();
				});
		});
	});

	describe('User resource tests', function () {

		it('should retrieve user with specified key', function (done) {
			superagent.get(baseURL + '/users/' + key)
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('1');
					expect(res.body[0].email).to.eql('test@test.com');
					expect(res.body[0].username).to.eql('test');
					done();
				});
		});

		it('should not be able to retrieve user with specified key if no authorization header is provided', function (done) {
			superagent.get(baseURL + '/users/' + key)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(res.body).to.be.an('object');
					expect(res.body).to.be.empty();
					done();
				});
		});

		it('should retrieve all users', function (done) {
			superagent.get(baseURL + '/users')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(res.status).to.eql(200);
					expect(res.body).to.be.an('object');
					expect(res.body.length).to.eql(2);
					expect(res.body[0].key).to.eql('1');
					expect(res.body[0].email).to.eql('test@test.com');
					expect(res.body[0].username).to.eql('test');
					expect(res.body[1].key).to.eql('2');
					expect(res.body[1].email).to.eql('test2@test.com');
					expect(res.body[1].username).to.eql('test2');
					done();
				});
		});

		it('should retrieve all users of a project', function (done) {
			superagent.get(baseURL + '/users')
				.set('Authorization', authHeader)
				.query({project: 'testProject2'})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('2');
					expect(res.body[0].email).to.eql('test2@test.com');
					expect(res.body[0].username).to.eql('test2');
					expect(res.body[0].project).to.eql('testProject2');
					done();
				});
		});

		it('should update user with specified key', function (done) {
			superagent.put(baseURL + '/users/' + key)
				.set('Authorization', authHeader)
				.send({email: 'updated@test.com', firstName: 'updatedFirstName', lastName: 'updatedLastName'})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.key).to.eql('1');
					expect(res.body.email).to.eql('updated@test.com');
					expect(res.body.firstName).to.eql('updatedFirstName');
					expect(res.body.lastName).to.eql('updatedLastName');

					done();
				});
		});
	});

	describe('Tickets resource tests', function () {

		it('should retrieve all tickets', function (done) {
			superagent.get(baseURL + '/tickets')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('1');
					expect(res.body[0].code).to.eql('1');
					expect(res.body[0].title).to.eql('test ticket');
					expect(res.body[0].status).to.eql('open');
					expect(res.body[0].type).to.eql('bug');
					expect(res.body[0].description).to.eql('the test ticket');
					expect(res.body[0].owner).to.eql('test');
					done();
				});
		});

		it('should create a ticket for the authenticated user', function (done) {
			superagent.post(baseURL + '/tickets')
				.set('Authorization', authHeader)
				.send({
					title: 'new ticket',
					status: 'created',
					type: 'task',
					description: 'the new ticket',
					owner: 'test'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(201);
					expect(res.body.title).to.eql('new ticket');
					expect(res.body.status).to.eql('created');
					expect(res.body.type).to.eql('task');
					expect(res.body.description).to.eql('the new ticket');
					expect(res.body.owner).to.eql('test');

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.tickets[1].title).to.eql('new ticket');
						expect(user.tickets[1].status).to.eql('created');
						expect(user.tickets[1].type).to.eql('task');
						expect(user.tickets[1].description).to.eql('the new ticket');
						expect(user.tickets[1].owner).to.eql('test');
					});

					done();
				});
		});

		it('should update ticket with the given key', function (done) {
			superagent.put(baseURL + '/tickets/' + key)
				.set('Authorization', authHeader)
				.send({
					title: 'updated ticket',
					status: 'closed',
					type: 'task',
					description: 'the updated ticket',
					owner: 'test'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.title).to.eql('updated ticket');
					expect(res.body.status).to.eql('closed');
					expect(res.body.type).to.eql('task');
					expect(res.body.description).to.eql('the updated ticket');
					expect(res.body.owner).to.eql('test');

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.tickets[0].title).to.eql('updated ticket');
						expect(user.tickets[0].status).to.eql('closed');
						expect(user.tickets[0].type).to.eql('task');
						expect(user.tickets[0].description).to.eql('the updated ticket');
						expect(user.tickets[0].owner).to.eql('test');
					});

					done();
				});
		});

		it('should not update ticket if the given key is nonexistent', function (done) {
			superagent.put(baseURL + '/tickets/' + nonExistentKey)
				.set('Authorization', authHeader)
				.send({
					title: 'updated ticket',
					status: 'closed',
					type: 'task',
					description: 'the updated ticket',
					owner: 'test'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(404);

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.tickets[0].title).to.eql('test ticket');
						expect(user.tickets[0].status).to.eql('open');
						expect(user.tickets[0].type).to.eql('bug');
						expect(user.tickets[0].description).to.eql('the test ticket');
						expect(user.tickets[0].owner).to.eql('test');
					});

					done();
				});
		});

		it('should delete ticket with the given key', function (done) {
			superagent.del(baseURL + '/tickets/' + key)
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(204);
					expect(res.body).to.be.empty();

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.tickets).to.be.empty();
					});

					done();
				});
		});

		it('should not delete ticket if the given key is nonexistent', function (done) {
			superagent.del(baseURL + '/tickets/' + nonExistentKey)
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(404);

					done();
				});
		});

	});

	describe('Settings resource tests', function () {

		it('should retrieve all settings', function (done) {
			superagent.get(baseURL + '/settings')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('1');
					expect(res.body[0].displayUserActivity).to.eql(true);
					expect(res.body[0].displayUserEmail).to.eql(true);
					expect(res.body[0].displayUserChart).to.eql(false);
					expect(res.body[0].displayUserRole).to.eql(false);
					done();
				});
		});

		it('should update setting with the given key', function (done) {
			superagent.put(baseURL + '/settings/' + key)
				.set('Authorization', authHeader)
				.send({displayUserEmail: false})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('1');
					expect(res.body[0].displayUserActivity).to.eql(true);
					expect(res.body[0].displayUserEmail).to.eql(false);
					expect(res.body[0].displayUserChart).to.eql(false);
					expect(res.body[0].displayUserRole).to.eql(false);
					done();
				});
		});

		it('should update settings of all users', function (done) {
			superagent.put(baseURL + '/settings')
				.set('Authorization', authHeader)
				.send({displayUserEmail: true, displayUserChart: true})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.displayUserEmail).to.eql(true);
					expect(res.body.displayUserChart).to.eql(true);

					User.findOne({
						key: '1'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.settings.length).to.eql(1);
						expect(user.settings[0].displayUserEmail).to.eql(true);
						expect(user.settings[0].displayUserChart).to.eql(true);
					});

					User.findOne({
						key: '2'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.settings.length).to.eql(1);
						expect(user.settings[0].displayUserEmail).to.eql(true);
						expect(user.settings[0].displayUserChart).to.eql(true);
					});

					done();
				});
		});
	});

	describe('Logs resource tests', function () {

		it('should retrieve all log entries', function (done) {
			superagent.get(baseURL + '/logs')
				.set('Authorization', authHeader)
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(200);
					expect(res.body.length).to.eql(1);
					expect(res.body[0].key).to.eql('1');
					done();
				});
		});

		it('should create a log entry for the authenticated user', function (done) {
			superagent.post(baseURL + '/logs')
				.set('Authorization', authHeader2)
				.send({
					action: 'action',
					target: 'target',
					targetType: 'targetType',
					comment: 'comment',
					amount: 1,
					username: 'test2'
				})
				.end(function (e, res) {
					expect(e).to.eql(null);
					expect(typeof res.body).to.eql('object');
					expect(res.status).to.eql(201);
					expect(res.body.action).to.eql('action');
					expect(res.body.target).to.eql('target');
					expect(res.body.targetType).to.eql('targetType');
					expect(res.body.comment).to.eql('comment');
					expect(res.body.amount).to.eql(1);
					expect(res.body.username).to.eql('test2');

					User.findOne({
						key: '2'
					}, function (err, user) {
						if (err)
							expect().fail(err);

						expect(user.logs.length).to.eql(1);
						expect(user.logs[0].username).to.eql(user.username);
					});

					done();
				});
		});
	});
});