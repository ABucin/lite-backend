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

    mongoose.connection.once('open', function () {
        console.log('Connection to DB established...');
    });

    /**
     * Populates the DB with relevant data before each test.
     */
    beforeEach(function (done) {
        Settings.collection.drop();
        User.collection.drop();
        Comment.collection.drop();
        Ticket.collection.drop();
        Log.collection.drop();

        var log1 = new Log({
            _id: "l1",
            username: 'test',
            targetType: "targetType",
            target: "target",
            action: "action"
        });
        var log2 = new Log({
            _id: "l2",
            username: 'test',
            targetType: "targetType",
            target: "target2",
            action: "action2"
        });
        var comment1 = new Comment({_id: "c1", content: 'comment', ticket: '1', author: 'test'});
        var ticket1 = new Ticket({
            _id: "t1",
            code: '1',
            title: 'test ticket',
            status: 'open',
            type: 'bug',
            description: 'the test ticket',
            owner: 'test'
        });
        var ticket2 = new Ticket({
            _id: "t2",
            code: '2',
            title: 'test ticket2',
            status: 'closed',
            type: 'task',
            description: 'the test ticket2',
            owner: 'test2'
        });
        var setting1 = new Settings({_id: 's1', displayUserActivity: true, displayUserEmail: true});
        var setting2 = new Settings({_id: 's2', displayUserChart: true, displayUserRole: true});
        var user1 = new User({
            _id: "u1",
            email: 'test@test.com',
            username: 'test',
            firstName: "John",
            lastName: "Doe",
            password: 'test',
            project: "testProject",
            logs: [],
            settings: setting1,
            tickets: [ticket1._id],
            comments: [comment1._id]
        });
        var user2 = new User({
            _id: "u2",
            email: 'test2@test.com',
            username: 'test2',
            password: 'test2',
            project: "testProject2",
            logs: [],
            settings: setting2,
            tickets: [ticket2._id],
            comments: []
        });

        var users = [user1, user2];
        var comments = [comment1];
        var settings = [setting1, setting2];
        var tickets = [ticket1, ticket2];
        var logs = [log1, log2];

        Ticket.create(tickets, function (err) {
            if (err) {
                return console.error(err);
            }
        });

        Comment.create(comments, function (err) {
            if (err) {
                return console.error(err);
            }
        });

        Log.create(logs, function (err) {
            if (err) {
                return console.error(err);
            }
        });

        User.create(users, function (err) {
            if (err) {
                return console.error(err);
            }
        });

        Settings.create(settings, function (err) {
            if (err) {
                return console.error(err);
            }
        });

        done();
    });

    describe('Analytics resource tests', function () {

        it('should retrieve chart with specified type', function (done) {
            var chartType = 'effortEstimation';

            superagent.get(baseURL + '/analytics')
                .set('Authorization', authHeader)
                .query({type: chartType})
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

                    var newUserId = res.body._id;

                    User.findOne({
                        _id: newUserId
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

        xit('should retrieve comment with specified id', function (done) {
            var id = "c1";

            superagent.get(baseURL + '/comments/' + id)
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body._id).to.eql('c1');
                    expect(res.body.ticket).to.eql('1');
                    expect(res.body.content).to.eql('comment');
                    expect(res.body.author).to.eql('test');
                    done();
                });
        });

        xit('should add a comment', function (done) {
            var ticketId = "t1";
            var userId = "u1";

            superagent.post(baseURL + '/users/' + userId + '/tickets/' + ticketId + '/comments')
                .set('Authorization', authHeader)
                .send({ticket: '1', content: 'comment2', author: 'test2'})
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(201);
                    expect(res.body.ticket).to.eql('t1');
                    expect(res.body.content).to.eql('comment2');
                    expect(res.body.author).to.eql('test2');

                    User.findOne({
                        _id: "u1"
                    }, function (err, user) {
                        if (err)
                            expect().fail(err);

                        expect(user.comments.length).to.eql(2);
                    });

                    done();
                });
        });

        xit('should update the comment with the given id', function (done) {
            var id = "c1";

            superagent.put(baseURL + '/comments/' + id)
                .set('Authorization', authHeader)
                .send({ticket: '1', content: 'updatedComment2', author: 'updatedTest2'})
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body._id).to.eql('c1');
                    expect(res.body.ticket).to.eql('1');
                    expect(res.body.content).to.eql('updatedComment2');
                    expect(res.body.author).to.eql('updatedTest2');
                    expect(res.body.isEdited).to.eql(true);

                    Comment.findOne({
                        _id: id
                    }, function (err, comment) {
                        if (err)
                            expect().fail(err);

                        expect(comment._id).to.eql('c1');
                        expect(comment.ticket).to.eql('1');
                        expect(comment.content).to.eql('updatedComment2');
                        expect(res.body.author).to.eql('updatedTest2');
                        expect(comment.isEdited).to.eql(true);
                    });

                    done();
                });
        });

        it('should delete the comment with the given id', function (done) {
            var id = "c1";

            superagent.del(baseURL + '/comments/' + id)
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(204);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.empty();

                    User.findOne({
                        _id: 'u1'
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

        it('should retrieve user with specified id', function (done) {
            var id = "u1";

            superagent.get(baseURL + '/users/' + id)
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body.length).to.eql(1);
                    expect(res.body[0]._id).to.eql('u1');
                    expect(res.body[0].email).to.eql('test@test.com');
                    expect(res.body[0].username).to.eql('test');
                    done();
                });
        });

        it('should not be able to retrieve user with specified id if no authorization header is provided', function (done) {
            var id = "u1";

            superagent.get(baseURL + '/users/' + id)
                .end(function (e, res) {
                    expect(e).not.to.eql(null);
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
                    expect(res.body[0]._id).to.eql('u1');
                    expect(res.body[0].email).to.eql('test@test.com');
                    expect(res.body[0].username).to.eql('test');
                    expect(res.body[1]._id).to.eql('u2');
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
                    expect(res.body[0]._id).to.eql('u2');
                    expect(res.body[0].email).to.eql('test2@test.com');
                    expect(res.body[0].username).to.eql('test2');
                    expect(res.body[0].project).to.eql('testProject2');
                    done();
                });
        });

        it('should update user with specified id', function (done) {
            var id = "u1";

            superagent.put(baseURL + '/users/' + id)
                .set('Authorization', authHeader)
                .send({email: 'updated@test.com', firstName: 'updatedFirstName', lastName: 'updatedLastName'})
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body._id).to.eql('u1');
                    expect(res.body.email).to.eql('updated@test.com');
                    expect(res.body.firstName).to.eql('updatedFirstName');
                    expect(res.body.lastName).to.eql('updatedLastName');

                    done();
                });
        });
    });

    describe('Tickets resource tests', function () {

        xit('should retrieve all tickets for the given user', function (done) {
            var userId = "u1";

            superagent.get(baseURL + '/users/' + userId + '/tickets')
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body.length).to.eql(1);
                    expect(res.body[0]).to.eql('t1');
                    done();
                });
        });

        xit('should create a ticket for the authenticated user', function (done) {
            var userId = 'u1';

            superagent.post(baseURL + 'users/' + userId + '/tickets')
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
                        _id: 'u1'
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

        xit('should update ticket with the given id', function (done) {
            var id = "t1";

            superagent.put(baseURL + '/tickets/' + id)
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
                        _id: 'u1'
                    }, function (err, user) {
                        if (err)
                            expect().fail(err);

                        expect(user.tickets.length).to.be(1);
                        expect(user.tickets[0].title).to.eql('updated ticket');
                        expect(user.tickets[0].status).to.eql('closed');
                        expect(user.tickets[0].type).to.eql('task');
                        expect(user.tickets[0].description).to.eql('the updated ticket');
                        expect(user.tickets[0].owner).to.eql('test');
                    });

                    done();
                });
        });

        it('should not update ticket if the given id is nonexistent', function (done) {
            var nonExistentId = "x1";

            superagent.put(baseURL + '/tickets/' + nonExistentId)
                .set('Authorization', authHeader)
                .send({
                    title: 'updated ticket',
                    status: 'closed',
                    type: 'task',
                    description: 'the updated ticket',
                    owner: 'test'
                })
                .end(function (e, res) {
                    expect(e).not.to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(404);

                    done();
                });
        });

        it('should delete ticket with the given id', function (done) {
            var id = "t1";

            superagent.del(baseURL + '/tickets/' + id)
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(204);
                    expect(res.body).to.be.empty();

                    Ticket.findOne({
                        _id: 't1'
                    }, function (err, ticket) {
                        if (err)
                            expect().fail(err);

                        expect(ticket).to.eql(null);
                    });

                    done();
                });
        });

        it('should not delete ticket if the given id is nonexistent', function (done) {
            var nonExistentId = "x1";

            superagent.del(baseURL + '/tickets/' + nonExistentId)
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(204);

                    done();
                });
        });

    });

    describe('Settings resource tests', function () {

        it('should retrieve settings for current user', function (done) {
            var id = "u1";

            superagent.get(baseURL + '/users/' + id + '/settings')
                .set('Authorization', authHeader)
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body._id).to.eql('s1');
                    expect(res.body.displayUserActivity).to.eql(true);
                    expect(res.body.displayUserEmail).to.eql(true);
                    expect(res.body.displayUserChart).to.eql(false);
                    expect(res.body.displayUserRole).to.eql(false);
                    done();
                });
        });

        it('should update setting for currently authenticated user', function (done) {
            var uid = "u1";
            var id = "s1";

            superagent.put(baseURL + '/users/' + uid + '/settings/' + id)
                .set('Authorization', authHeader)
                .send({displayUserEmail: false})
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.status).to.eql(200);
                    expect(res.body._id).to.eql('s1');
                    expect(res.body.displayUserActivity).to.eql(true);
                    expect(res.body.displayUserEmail).to.eql(false);
                    expect(res.body.displayUserChart).to.eql(false);
                    expect(res.body.displayUserRole).to.eql(false);
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
                    expect(res.body.length).to.eql(2);
                    expect(res.body[0]._id).to.eql('l1');
                    expect(res.body[1]._id).to.eql('l2');
                    done();
                });
        });

        it('should create a log entry for the authenticated user', function (done) {
            var id = 'u1';

            superagent.post(baseURL + '/users/' + id + '/logs')
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
                        _id: 'u1'
                    }, function (err, user) {
                        if (err)
                            expect().fail(err);

                        expect(user.logs.length).to.eql(1);
                    });

                    done();
                });
        });
    });
});