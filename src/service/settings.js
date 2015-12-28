var User = new require('../model/user');
var Settings = new require('../model/settings');

exports.getSettings = function (req, res) {
    // user is added by Passport middleware into request
    User.findById(req.user._id,
        function (err, user) {
            if (err)
                return res.status(500).send({message: "Failed to query user."});

            if (!user)
                return res.status(404).send({message: "User not found."});

            res.json(user.settings);
        });
};

exports.updateSettings = function (req, res) {
    Settings.findByIdAndUpdate(req.user.settings._id, {$set: req.body}, {new: true},
        function (err, setting) {
            if (err)
                return res.status(500).send(err);

            res.json(setting);
        });
};