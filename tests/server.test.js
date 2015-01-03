/**
 * Created by ABucin on 28/12/2014.
 */

var superagent = require('superagent'),
    mongoose = require('mongoose'),
    expect = require('expect.js'),
    config = require('../config.json'),
    User = require('../src/model/user'),
    Log = require('../src/model/log'),
    baseURL = "http://localhost:" + config.port + config.root,
    authHeader = 'Basic dGVzdDp0ZXN0';

describe('Server tests', function () {
    mongoose.connect(config.dbURI);

    var key = 1,
        db = mongoose.connection;

    db.once('open', function () {
        console.log('Connection to DB established...');
    });

    /**
     * Populates the DB with relevant data before each test.
     */
    beforeEach(function (done) {
        var log = new Log({key: '1', username: 'test', targetType: "targetType", target: "target", action: "action"});

        new User({key: '1', email: 'test@test.com', username: 'test', password: 'test', logs: [log]})
            .save(function (err) {
                if (err) {
                    return done(err);
                }

                done();
            });
    });

    /**
     * Cleans up the DB after each test.
     */
    afterEach(function (done) {
        User.collection.drop();

        done();
    });

    it('retrieve user with specified key', function (done) {
        superagent.get(baseURL + '/users/' + key)
            .set('Authorization', authHeader)
            .end(function (e, res) {
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.length).to.eql(1);
                expect(res.body[0].key).to.eql(key);
                expect(res.body[0].email).to.eql('test@test.com');
                done();
            });
    });

    it('retrieve all logs', function (done) {
        superagent.get(baseURL + '/logs')
            .set('Authorization', authHeader)
            .end(function (e, res) {
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.length).to.eql(1);
                expect(res.body[0].key).to.eql(key);
                done();
            });
    });

});