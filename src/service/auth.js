// Load required packages
var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('./../model/user');

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

exports.isAuthenticated = passport.authenticate('basic', {session: false});