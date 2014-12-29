/**
 * Created by ABucin on 28/12/2014.
 */

var superagent = require('superagent'),
    mongoose = require('mongoose'),
    expect = require('expect.js'),
    config = require('./../config.json'),
    User = require('../server/model/user'),
    baseURL = "http://localhost:" + config.port + config.root;

describe('Server tests', function () {
    var key = 1;

    mongoose.connect(config.dbURI);

    var db = mongoose.connection;
    db.once('open', function () {
        console.log('Connection to DB established...');
    });

    beforeEach(function (done) {
        new User({key: '1', email: 'test@test.com'}).save(function (err) {
            if (err) {
                return done(err);
            }

            done();
        });
    });

    afterEach(function (done) {
        User.collection.drop();

        done();
    });

    it('retrieve user with specified key', function (done) {
        superagent.get(baseURL + '/users/' + key)
            .end(function (e, res) {
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.length).to.eql(1);
                expect(res.body[0].key).to.eql(key);
                expect(res.body[0].email).to.eql('test@test.com');
                done();
            });
    });

});