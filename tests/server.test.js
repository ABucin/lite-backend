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
    baseURL = "http://localhost:" + config.port + config.root,
    authHeader = 'Basic dGVzdDp0ZXN0',
    authHeader2 = 'Basic dGVzdDI6dGVzdDI=';

describe('Server tests', function () {
    mongoose.connect(config.dbURI);

    var key = '1',
        db = mongoose.connection;

    db.once('open', function () {
        console.log('Connection to DB established...');
    });

    /**
     * Populates the DB with relevant data before each test.
     */
    beforeEach(function (done) {
        User.collection.drop();

        var log = new Log({
            key: '1',
            username: 'test',
            targetType: "targetType",
            target: "target",
            action: "action"
        });

        var settings = new Settings({key: '1', displayUserActivity: true, displayUserEmail: true});

        new User({
            key: '1',
            email: 'test@test.com',
            username: 'test',
            firstName: "John",
            lastName: "Doe",
            password: 'test',
            project: "testProject",
            logs: [log],
            settings: [settings]
        }).save(function (err) {
                if (err) {
                    return done(err);
                }

                new User({
                    key: '2',
                    email: 'test2@test.com',
                    username: 'test2',
                    password: 'test2',
                    project: "testProject2",
                    logs: [],
                    settings: [settings]
                }).save(function (err) {
                        if (err) {
                            return done(err);
                        }

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
                    expect(res.body.key).to.eql('1');
                    expect(res.body.email).to.eql('updated@test.com');
                    expect(res.body.firstName).to.eql('updatedFirstName');
                    expect(res.body.lastName).to.eql('updatedLastName');
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
                    expect(res.body.length).to.eql(1);
                    expect(res.body[0].key).to.eql('1');
                    expect(res.body[0].displayUserActivity).to.eql(true);
                    expect(res.body[0].displayUserEmail).to.eql(true);
                    expect(res.body[0].displayUserChart).to.eql(false);
                    expect(res.body[0].displayUserRole).to.eql(false);
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
                    expect(res.body.length).to.eql(1);
                    expect(res.body[0].key).to.eql('1');
                    done();
                });
        });

        it('should create a log entry for the specified user', function (done) {
            superagent.post(baseURL + '/logs')
                .set('Authorization', authHeader2)
                .send({action: 'action', target: 'target', targetType: 'targetType', comment: 'comment', amount: 1, username: 'test2'})
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(typeof res.body).to.eql('object');
                    expect(res.body.action).to.eql('action');
                    expect(res.body.target).to.eql('target');
                    expect(res.body.targetType).to.eql('targetType');
                    expect(res.body.comment).to.eql('comment');
                    expect(res.body.amount).to.eql(1);
                    expect(res.body.username).to.eql('test2');

                    User.findOne({
                        'key': '2'
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