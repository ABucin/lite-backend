// Load required packages
var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../model/user'),
    utils = require('../utils/utils');

/**
 * Authentication config.
 */
passport.use(new BasicStrategy(
    function (username, password, done) {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            // Make sure the password is correct
            user.verifyPassword(password, function (err, isMatch) {
                if (err) {
                    return done(err);
                }

                // Password did not match
                if (!isMatch) {
                    return done(null, false);
                }

                // Success
                return done(null, user);
            });
        });
    }
));

/**
 * Authentication.
 */
exports.register = function (req, res) {
    new User({
        key: utils.generateKey(),
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        settings: [{
            key: utils.generateKey(),
            displayUserActivity: true,
            displayUserChart: true,
            displayUserEmail: true,
            displayUserRole: true
        }]
    }).save(function (err) {
            if (err) {
                console.log("Registration error %s", err);
                res.status(500).send(err);
            } else {
                passport.authenticate('local')(req, res, function () {
                    console.log("Registration successful. User %s authenticated.", req.body.username);
                    User.findOne({
                        'username': req.body.username
                    }, function (err, user) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(201).send({
                                key: user.key,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                                projectRole: user.projectRole,
                                project: user.project,
                                expertise: user.expertise,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                settings: user.settings
                            });
                        }
                    });
                });
            }
        });
};

exports.login = function (req, res) {
    User.findOne({
        'username': req.body.username
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send({
                key: user.key,
                username: user.username,
                email: user.email,
                role: user.role,
                projectRole: user.projectRole,
                project: user.project,
                expertise: user.expertise,
                firstName: user.firstName,
                lastName: user.lastName,
                settings: user.settings
            });
        }
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.status(200).send();
};

exports.isAuthenticated = passport.authenticate('basic', {session: false});