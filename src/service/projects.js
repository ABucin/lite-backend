var User = require('../model/user'),
    _ = require('underscore')._;

exports.updateProject = function (req, res) {
    User.find({
        project: req.params.projectId
    }, function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(users, function (user) {
                user.project = req.body.project;
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