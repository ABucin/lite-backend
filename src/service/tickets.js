var Ticket = require('../model/ticket'),
    User = require('../model/user'),
    mongoose = require('mongoose'),
    _ = require('underscore')._;

exports.createTicket = function (req, res) {
    // save the ticket and check for errors
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else if (user === null) {
            res.status(404).send();
        } else {
            User.find(function (err, users) {
                if (err)
                    res.status(500).send(err);

                var tickets = [];

                _.each(users, function (e) {
                    tickets = _.union(tickets, e.tickets);
                });

                var latestTicket = _.max(tickets, function (ticket) {
                        return ticket.code;
                    }),
                    ticketData = {
                        _id: mongoose.Types.ObjectId(),
                        title: req.body.title,
                        status: 'created',
                        type: req.body.type,
                        description: req.body.description,
                        loggedTime: req.body.loggedTime,
                        estimatedTime: req.body.estimatedTime,
                        remainingTime: req.body.estimatedTime,
                        owner: req.body.owner,
                        priority: req.body.priority,
                        code: latestTicket.code + 1
                    };

                user.tickets.push(new Ticket(ticketData));

                user.save(function (err) {
                    if (err)
                        res.status(500).send(err);

                    res.status(201).json(ticketData);
                });
            });
        }
    });
};

exports.getTickets = function (req, res) {
    // TODO: remake this so it returns all ticket objects for user
    User.findOne({
        _id: req.params.id
    }, function (err, user) {
        if (err)
            res.status(500).send(err);
        else
            res.json(user.tickets);
    });
};

exports.updateTicket = function (req, res) {
    // save the ticket and check for errors
    Ticket.findOne({
        _id: req.params.id
    }, function (err, ticket) {
        var validationErrors = [];

        if (err)
            res.status(500).send(err);

        else if (!ticket)
            res.status(404).send();
        else {
            if (req.body.title) {
                ticket.title = req.body.title;
            }
            else {
                validationErrors.push({
                    message: 'Title must be provided.'
                });
            }

            if (req.body.status) {
                ticket.status = req.body.status;
            }

            if (req.body.loggedTime) {
                ticket.loggedTime = req.body.loggedTime;
            }

            if (req.body.estimatedTime) {
                ticket.estimatedTime = req.body.estimatedTime;
            }

            if (req.body.loggedTime && req.body.estimatedTime) {
                ticket.remainingTime = req.body.estimatedTime - req.body.loggedTime;
            }

            ticket.description = req.body.description;
            ticket.owner = req.body.owner;
            ticket.priority = req.body.priority;
            ticket.type = req.body.type;

            if (validationErrors.length)
                res.status(500).send(validationErrors);

            ticket.save(function (err) {
                if (err)
                    res.status(500).send(err);

                res.json(ticket);
            });
        }

    });
};

exports.deleteTicket = function (req, res) {
    Ticket.remove({
        _id: req.params.id
    }, function (err) {
        if (err)
            res.status(500).send(err);

        res.status(204).json();
    });
};