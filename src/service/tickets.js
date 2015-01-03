var Ticket = require('../model/ticket'),
    User = require('../model/user'),
    _ = require('underscore')._;

exports.createTicket = function (req, ticket, res) {
    var ticketData = {
        key: utils.generateKey(),
        title: req.body.title,
        status: 'created',
        type: req.body.type,
        description: req.body.description,
        loggedTime: req.body.loggedTime,
        estimatedTime: req.body.estimatedTime,
        remainingTime: req.body.estimatedTime,
        owner: req.body.owner,
        priority: req.body.priority
    };

    // save the ticket and check for errors
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else if (user === null) {
            res.status(404).send();
        } else {
            User.find(function (err, users) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var tickets = [];

                    _.each(users, function (e) {
                        tickets = _.union(tickets, e.tickets);
                    });

                    var latestTicket = _.max(tickets, function (ticket) {
                        return ticket.code;
                    });

                    ticketData.code = latestTicket.code + 1;
                    user.tickets.push(new Ticket(ticketData));

                    user.save(function (err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.json(ticketData);
                        }
                    });
                }
            });
        }
    });
};

exports.getTickets = function (req, res) {
    User.findOne({
        'key': req.user.key
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json([user.tickets]);
        }
    });
};

exports.updateTicket = function (ticketId, ticket, res) {
    // save the ticket and check for errors
    User.find().exec(
        function (err, users) {
            var errorResponse = [];
            if (err) {
                res.status(500).send(err);
            } else {
                _.each(users, function (user) {
                    _.each(user.tickets, function (el) {
                        if (el.key == req.params.ticketId) {

                            if (req.body.title != null && req.body.title.length) {
                                el.title = req.body.title;
                            } else {
                                errorResponse.push({
                                    message: 'Title must be provided.'
                                });
                            }
                            if (req.body.status != null) {
                                el.status = req.body.status;
                            }
                            if (req.body.loggedTime != null) {
                                el.loggedTime = req.body.loggedTime;
                            }
                            if (req.body.estimatedTime != null) {
                                el.estimatedTime = req.body.estimatedTime;
                            }
                            if(req.body.loggedTime != null && req.body.estimatedTime != null) {
                                el.remainingTime = req.body.estimatedTime - req.body.loggedTime;
                            }
                            el.description = req.body.description;
                            el.owner = req.body.owner;
                            el.priority = req.body.priority;
                            el.type = req.body.type;

                            if (errorResponse.length) {
                                res.status(500).send(errorResponse);
                            } else {
                                user.save(function (err) {
                                    if (err) {
                                        res.status(500).send(err);
                                    } else {
                                        res.json(req.body);
                                    }
                                });
                            }
                        }
                    });
                });
            }
        }
    );
};

exports.deleteTicket = function (req, res) {
    User.find().exec(function (err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            _.each(users, function (user) {
                _.each(user.tickets, function (ticket, ix) {
                    if (ticket !== undefined && ticket.key == req.params.ticketId) {
                        user.tickets.splice(ix, 1);
                    }
                });

                _.each(user.comments, function (comment, ix) {
                    if (comment !== undefined && comment.ticket == req.params.ticketId) {
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
            });
        }
    });
};