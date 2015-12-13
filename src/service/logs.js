var mongoose = require('mongoose'),
    Log = require('../model/log'),
    User = require('../model/user'),
    LOG_LIMIT = 10;

exports.getAllLogs = function (req, res) {
    Log.find()
        .sort('-timestamp')
        .limit(LOG_LIMIT)
        .exec(function (err, logs) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(logs);
            }
        });
};

exports.createLog = function (req, res) {
    var log = new Log({
        _id: mongoose.Types.ObjectId(),
        action: req.body.action,
        target: req.body.target,
        targetType: req.body.targetType,
        comment: req.body.comment,
        amount: req.body.amount,
        username: req.body.username,
        timestamp: new Date()
    });

    // save the log and check for errors
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            log.save(function (err) {
                if (err)
                    res.status(500).send(err);
                else {
                    user.logs.push(log._id);

                    user.save(function (err) {
                        if (err)
                            res.status(500).send(err);
                        else
                            res.status(201).json(log);
                    });
                }
            });
        }
    });
};