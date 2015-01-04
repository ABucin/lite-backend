var Log = require('../model/log'),
    User = require('../model/user'),
    utils = require('../utils/utils'),
    _ = require('underscore')._;

exports.getAllLogs = function (req, res) {
    User.find()
        .sort('-timestamp')
        .limit(10)
        .exec(function (err, users) {
            if (err) {
                res.status(500).send(err);
            } else {
                var logs = [];

                _.each(users, function (e) {
                    logs = _.union(logs, e.logs);
                });

                logs.sort(function (a, b) {
                    if (a.timestamp < b.timestamp) return 1;
                    if (b.timestamp < a.timestamp) return -1;
                    return 0;
                });

                res.json(logs);
            }
        });
};

exports.createLog = function (req, res) {
    var logData = {
        key: utils.generateKey(),
        action: req.body.action,
        target: req.body.target,
        targetType: req.body.targetType,
        comment: req.body.comment,
        amount: req.body.amount,
        username: req.body.username,
        timestamp: new Date()
    };

    // save the log and check for errors
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err)
            res.status(500).send(err);

        user.logs.push(new Log(logData));

        user.save(function (err) {
            if (err)
                res.status(500).send(err);

            res.json(logData);
        });
    });
};