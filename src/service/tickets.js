var Ticket = new require('../model/ticket'),
    User = new require('../model/user'),
    mongoose = require('mongoose'),
    _ = require('underscore')._;

exports.createTicket = function (req, res) {
    // save the ticket and check for errors
    Ticket.find(function (err, tickets) {
        if (err)
            return res.status(500).send(err);

        var latestTicket = _.max(tickets, function (ticket) {
            return ticket.code;
        });

        var ticketData = {
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

        req.user._tickets.push(ticketData._id);

        req.user.save(function (err) {
            if (err)
                return res.status(500).send(err);

            var ticket = new Ticket(ticketData);

            ticket.save(function (err) {
                if (err)
                    return res.status(500).send(err);

                res.status(201).json(ticketData);
            });
        });
    });
};

exports.getTickets = function (req, res) {
    //TODO: remake this so it returns all ticket objects for user
    res.json(req.user._tickets);
};

exports.updateTicket = function (req, res) {
    // save the ticket and check for errors
    Ticket.findById(req.params.id,
        function (err, ticket) {
            var validationErrors = [];

            if (err)
                return res.status(500).send(err);

            if (!ticket)
                return res.status(404).send();

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
                return res.status(500).send(validationErrors);

            ticket.save(function (err) {
                if (err)
                    return res.status(500).send(err);

                res.json(ticket);
            });
        });
};

exports.deleteTicket = function (req, res) {
    Ticket.remove({
        _id: req.params.id
    }, function (err) {
        if (err)
            return res.status(500).send(err);

        res.status(204).json();
    });
};