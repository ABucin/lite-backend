var User = require('../model/user'),
	Settings = require('../model/settings'),
	_ = require('underscore')._;

exports.getSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		if (user) {

			Settings.findById(user.settings, function (err, setting) {
				if (err)
					res.status(500).send(err);

				res.json(setting);
			});
		}
	});
};

exports.updateSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		Settings.findById(user.settings, function (err, setting) {
			if (err)
				res.status(500).send(err);

			setting = req.body;

			setting.save(function (err) {
				if (err)
					res.status(500).send(err);

				res.json(setting);
			});
		});
	});
};