var User = require('../model/user'),
	_ = require('underscore')._;

exports.getSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		if (user != null)
			res.json(user.settings);
	});
};

exports.updateSettings = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		_.each(user.settings, function (s) {
			if (s.key == req.params.settingId) {
				if (req.body.displayUserActivity !== undefined)
					s.displayUserActivity = req.body.displayUserActivity;
				if (req.body.displayUserChart !== undefined)
					s.displayUserChart = req.body.displayUserChart;
				if (req.body.displayUserEmail !== undefined)
					s.displayUserEmail = req.body.displayUserEmail;
				if (req.body.displayUserRole !== undefined)
					s.displayUserRole = req.body.displayUserRole;
			}
		});

		user.save(function (err) {
			if (err)
				res.status(500).send(err);

			res.json(user.settings);
		});
	});
};

exports.updateAllSettings = function (req, res) {
	User.find(function (err, users) {
		if (err)
			res.status(500).send(err);

		_.each(users, function (user) {
			if (req.body.displayUserActivity !== undefined)
				user.settings[0].displayUserActivity = req.body.displayUserActivity;
			if (req.body.displayUserChart !== undefined)
				user.settings[0].displayUserChart = req.body.displayUserChart;
			if (req.body.displayUserEmail !== undefined)
				user.settings[0].displayUserEmail = req.body.displayUserEmail;
			if (req.body.displayUserRole !== undefined)
				user.settings[0].displayUserRole = req.body.displayUserRole;

			user.save(function (err) {
				if (err)
					res.status(500).send(err);
			});
		});

		res.json(req.body);
	});
};