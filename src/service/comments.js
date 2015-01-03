var Comment = require('../model/comment'),
    User = require('../model/user'),
    utils = require('../utils/utils'),
    _ = require('underscore')._;

exports.createComment = function (req, res) {
    var commentData = {
        key: utils.generateKey(),
        ticket: req.params.ticketId,
        content: req.body.content,
        author: req.body.author,
        timestamp: new Date()
    };

    // save the comment and check for errors
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            user.comments.push(new Comment(commentData));

            user.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(commentData);
                }
            });
        }
    });
};

exports.deleteComment = function (req, res) {
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(user.comments, function (comment, ix) {
                if (comment.key == req.params.commentId) {
                    user.comments.splice(ix, 1);
                }
            });

            user.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json();
                }
            });
        }
    });
};

exports.getComments = function (req, res) {
    User.find().exec(function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            var comments = [];

            _.each(users, function (user) {
                _.each(user.comments, function (comment) {
                    if (comment.ticket == req.params.ticketId) {
                        var c = {
                            key: comment.key,
                            author: user.username,
                            ticket: comment.ticket,
                            timestamp: comment.timestamp,
                            content: comment.content
                        };
                        comments.push(c);
                    }
                });
            });
            res.json(comments);
        }
    });
};

exports.updateComment = function (req, res) {
    // save the comment and check for errors
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        var errorResponse = [];
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(user.comments, function (c) {
                if (c.key == req.params.commentId) {

                    if (req.body.content != null && req.body.content.length) {
                        c.content = req.body.content;
                        c.isEdited = true;
                    } else {
                        errorResponse.push({
                            message: 'Content must be provided.'
                        });
                    }

                    if (errorResponse.length) {
                        res.status(500).send(errorResponse);
                    } else {
                        user.save(function (err) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            res.json(c);
                        });
                    }
                }
            });
        }
    });
};