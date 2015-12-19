// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = new require('../model/user');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = new require('./../../config.json');

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
    var user = new User({
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
    });

    user.save(function (err) {
        if (err)
            return res.status(500).send(err);

        passport.authenticate('local')(req, res, function () {
            User.findOne({
                username: req.body.username
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
        username: req.body.username
    }, function (err, user) {
        if (err)
            return res.status(500).send(err);

        if (!user)
            return res.status(401).send({message: "Invalid login."});

        var token = jwt.sign(user.username, config.secret, {
            expiresInMinutes: 15 // expires in 15 mins
        });

        res.status(200).send({authToken: token});
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.status(200).send();
};

exports.isAuthenticated = passport.authenticate('basic', {session: false});