// Load required packages
var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    User = new require('../model/user'),
    mongoose = require('mongoose');

/**
 * Configures the Passport module to allow the authentication of users.
 */
passport.use(new BasicStrategy(
    function (username, password, done) {
        User.findOne({username: username}, '+password', function (err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false);

            // Make sure the password is correct
            user.verifyPassword(password, function (err, isMatch) {
                if (err)
                    return done(err);

                // Password did not match
                if (!isMatch)
                    return done(null, false);

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
        _id: mongoose.Types.ObjectId(),
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        settings: {
            _id: mongoose.Types.ObjectId(),
            displayUserActivity: true,
            displayUserChart: true,
            displayUserEmail: true,
            displayUserRole: true
        }
    }).save(function (err) {
        if (err) {
            console.log("Registration error '%s'", err);
            return res.status(500).send(err);
        }

        passport.authenticate('local')(req, res, function () {
            var username = req.body.username;

            console.log("Registration successful. User '%s' authenticated.", username);
            User.findOne({
                username: username
            }, function (err, user) {
                if (err)
                    return res.status(500).send(err);

                res.status(201).send(user);
            });
        });
    });
};

exports.login = function (req, res) {
    User.findOne({
        'username': req.body.username
    }, function (err, user) {
        if (err)
            return res.status(500).send(err);

        if (!user)
            return res.status(401).send();

        res.status(200).send(user);
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.status(200).send();
};

exports.isAuthenticated = passport.authenticate('basic', {session: false});