var User = require('../model/user'),
    _ = require('underscore')._;

exports.getSettings = function (req, res) {
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else if (user != null) {
            res.json(user.settings);
        }
    });
};

exports.updateSettings = function (req, res) {
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(user.settings, function (s) {
                if (s.key == req.params.settingId) {
                    s.displayUserActivity = req.body.displayUserActivity;
                    s.displayUserChart = req.body.displayUserChart;
                    s.displayUserEmail = req.body.displayUserEmail;
                    s.displayUserRole = req.body.displayUserRole;
                }
            });

            user.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(req.body);
                }
            });
        }
    });
};

exports.updateAllSettings = function (req, res) {
    User.find(function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(users, function (user) {
                user.settings[0].displayUserEmail = req.body.displayUserEmail;
                user.settings[0].displayUserRole = req.body.displayUserRole;

                user.save(function (err) {
                    if (err) {
                        res.status(500).send(err);
                    }
                });
            });

            res.json(req.body);
        }
    });
};