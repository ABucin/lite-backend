//var superagent = new require('superagent');
//var expect = new require('expect.js');
//var User = new require('../src/model/user');
//var setup = new require('./utils/setup');
//var mongoose = new require('mongoose');
//var config = new require('../config.json');
//
//describe('Authentication tests', function () {
//    /**
//     * Populates the DB with relevant data before each test.
//     */
//    before(function (done) {
//        setup.connToDB(done);
//
//        /*if (mongoose.connection.db)
//        return done();*/
//
//        mongoose.connect(config.db, done);
//
//        var user = new User({
//            _id: 'u1',
//            email: 'test@test.com',
//            username: 'test',
//            firstName: 'John',
//            lastName: 'Doe',
//            password: 'test',
//            project: 'testProject',
//            _logs: [],
//            settings: [],
//            _tickets: [],
//            _comments: []
//        });
//
//        User.create([user], function (err) {
//            if (err) {
//                return console.error(err.message);
//            }
//        });
//    });
//
//    beforeEach(function(done){
//        User.collection.drop();
//
//        done();
//    });
//
//    after(function (done) {
//        mongoose.connection.close(done);
//        //User.remove({});
//    });
//
//    it('should allow the user to register', function (done) {
//        superagent.post('/auth/register')
//            .use(setup.urlPrefix)
//            .send({
//                username: 'newUsername',
//                email: 'email@test.com',
//                firstName: 'firstName',
//                lastName: 'lastName'
//            })
//            .end(function (e, res) {
//                expect(e).to.eql(null);
//                expect(typeof res.body).to.eql('object');
//                expect(res.status).to.eql(201);
//                expect(res.body.email).to.eql('email@test.com');
//                expect(res.body.username).to.eql('newUsername');
//                expect(res.body.firstName).to.eql('firstName');
//                expect(res.body.lastName).to.eql('lastName');
//
//                var newUserId = res.body._id;
//
//                User.findById(newUserId,
//                    function (err, user) {
//                        if (err)
//                            expect().fail(err);
//
//                        expect(user.email).to.eql('email@test.com');
//                        expect(user.username).to.eql('newUsername');
//                        expect(user.firstName).to.eql('firstName');
//                        expect(user.lastName).to.eql('lastName');
//                    });
//
//                done();
//            });
//    });
//
//    xit('should allow existing user to login', function (done) {
//        superagent.post('/auth/login')
//            .use(setup.urlPrefix)
//            .send({
//                username: 'test'
//            })
//            .end(function (e, res) {
//                expect(e).to.eql(null);
//                expect(typeof res.body).to.eql('object');
//                expect(res.status).to.eql(200);
//                expect(res.body.authToken).to.exist;
//
//                done();
//            });
//    });
//
//    xit('should allow existing user to logout', function (done) {
//        superagent.post('/auth/logout')
//            .use(setup.urlPrefix)
//            .end(function (e, res) {
//                expect(e).to.eql(null);
//                expect(typeof res.body).to.eql('object');
//                expect(res.status).to.eql(200);
//
//                done();
//            });
//    });
//});