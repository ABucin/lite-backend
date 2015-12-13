var User = require('../model/user');

var getUsersWithProject = function (req, res) {
    User.find({
        project: req.query.project
    }, function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(users);
        }
    });
};

var getUsers = function (req, res) {
    User.find(function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(users);
        }
    });
};

exports.getAllUsers = function (req, res) {
    if (!req.query.project) {
        getUsers(req, res);
    } else {
        getUsersWithProject(req, res);
    }
};

exports.getAllUsersCallback = function (cb) {
    User.find(function (err, users) {
        cb(users);
    });
};

exports.getUser = function (req, res) {
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json([user]);
        }
    });
};

exports.updateUser = function (req, res) {
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        }
        if (!user) {
            res.status(404).send();
        } else {
            if (req.body.project) {
                user.project = req.body.project;
            }
            if (req.body.firstName) {
                user.firstName = req.body.firstName;
            }
            if (req.body.lastName) {
                user.lastName = req.body.lastName;
            }
            if (req.body.email) {
                user.email = req.body.email;
            }
            if (req.body.expertise) {
                user.expertise = req.body.expertise;
            }

            user.save(function (err) {
                if (err)
                    res.status(500).send(err);

                res.json(user);
            });
        }
    });
};