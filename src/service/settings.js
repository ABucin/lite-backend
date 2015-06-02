var User = require('../model/user'),
	_ = require('underscore')._;

exports.getSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		if (user)
			res.json(user.settings);
	});
};

exports.updateSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		user.settings = req.body;

		user.save(function (err) {
			if (err)
				res.status(500).send(err);

			res.json(user.settings);
		});
	});
};