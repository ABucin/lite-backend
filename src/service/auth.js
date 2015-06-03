// Load required packages
var passport = require('passport'),
	BasicStrategy = require('passport-http').BasicStrategy,
	User = require('../model/user'),
	utils = require('../utils/utils');

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
		key: utils.generateKey(),
		username: req.body.username,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		settings: {
			key: utils.generateKey(),
			displayUserActivity: true,
			displayUserChart: true,
			displayUserEmail: true,
			displayUserRole: true
		}
	}).save(function (err) {
			if (err) {
				console.log("Registration error %s", err);
				res.status(500).send(err);
			} else {
				passport.authenticate('local')(req, res, function () {
					var username = req.body.username;

					console.log("Registration successful. User %s authenticated.", username);
					User.findOne({
						username: username
					}, function (err, user) {
						if (err) {
							res.status(500).send(err);
						}

						res.status(201).send(user);
					});
				});
			}
		});
};

exports.login = function (req, res) {
	User.findOne({
		'username': req.body.username
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		if (!user)
			res.status(401).send();

		res.status(200).send(user);
	});
};

exports.logout = function (req, res) {
	req.logout();
	res.status(200).send();
};

exports.isAuthenticated = passport.authenticate('basic', {session: false});