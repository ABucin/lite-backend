var mongoose = require('mongoose');
var Comment = new require('../model/comment');
var User = new require('../model/user');

exports.createComment = function (req, res) {
    var comment = new Comment({
        _id: mongoose.Types.ObjectId(),
        ticket: req.params.ticketId,
        content: req.body.content,
        author: req.body.author,
        timestamp: new Date()
    });

    // save the comment and check for errors
    User.findById(req.params.id,
        function (err, user) {
            if (err)
                return res.status(500).send(err);

            comment.save(function (err) {
                if (err)
                    return res.status(500).send(err);

                user._comments.push(comment._id);

                user.save(function (err) {
                    if (err)
                        return res.status(500).send(err);

                    res.status(201).json(comment);
                });
            });
        });
};

/**
 * Deletes comment with provided id.
 * @param req Object request
 * @param res Object response
 */
exports.deleteComment = function (req, res) {
    Comment.remove({
        _id: req.params.id
    }, function (err) {
        if (err)
            return res.status(500).send(err);

        res.status(204).json();
    });
};

/**
 * Retrieves comment with provided id.
 * @param req Object request body
 * @param res Object response
 */
exports.getComment = function (req, res) {
    Comment.findById(req.params.id,
        function (err, comment) {
            if (err)
                return res.status(500).send(err);

            res.json(comment);
        });
};

exports.updateComment = function (req, res) {
    // update the comment and check for errors
    Comment.findById(req.params.id,
        function (err, comment) {
            if (err) {
                return res.status(500).send(err);
            }

            if (req.body && req.body.content) {
                comment.content = req.body.content;
                comment.author = req.body.author;
                comment.isEdited = true;
            }

            comment.save(function (err) {
                if (err) {
                    return res.status(500).send(err);
                }

                res.json(comment);
            });
        });
};