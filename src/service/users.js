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
    if (req.query.project === undefined) {
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
        'key': req.params.userId
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
        'key': req.params.userId
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (req.body.project !== undefined) {
                user.project = req.body.project;
            }
            if (req.body.firstName !== undefined) {
                user.firstName = req.body.firstName;
            }
            if (req.body.lastName !== undefined) {
                user.lastName = req.body.lastName;
            }
            if (req.body.email !== undefined) {
                user.email = req.body.email;
            }
            if (req.body.expertise !== undefined) {
                user.expertise = req.body.expertise;
            }

            user.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(user);
                }
            });
        }
    });
};