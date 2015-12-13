var User = require('../model/user'),
    Settings = require('../model/settings');

exports.getSettings = function (req, res) {
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err)
            res.status(500).send(err);

        if (!user) {
            res.status(404).send("User not found!");
        }
        res.json(user.settings);
        /*Settings.findById(user.settings._id, function (err, setting) {
            if (err)
                res.status(500).send(err);

            res.json(setting);
        });*/
    });
};

exports.updateSettings = function (req, res) {
    User.findOne({
        _id: req.params.userId
    }, function (err, user) {
        if (err)
            res.status(500).send(err);

        if (!user) {
            res.status(404).send("User not found!");
        }

        Settings.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}, function (err, setting) {
            if (err)
                res.status(500).send(err);
            else
                res.json(setting);
        });
    });
};