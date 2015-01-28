var Ticket = require('../model/ticket'),
	User = require('../model/user'),
	utils = require('../utils/utils'),
	_ = require('underscore')._;

exports.createTicket = function (req, res) {
	// save the ticket and check for errors
	User.findOne({
		key: req.user.key
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
						key: utils.generateKey(),
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
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		if (err)
			res.status(500).send(err);

		res.json(user.tickets);
	});
};

exports.updateTicket = function (req, res) {
	// save the ticket and check for errors
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		var validationErrors = [],
			foundTicket = false;
		if (err)
			res.status(500).send(err);

		_.each(user.tickets, function (ticket) {
			if (ticket.key == req.params.ticketId) {

				if (req.body.title != null && req.body.title.length) {
					ticket.title = req.body.title;
				}
				else {
					validationErrors.push({
						message: 'Title must be provided.'
					});
				}

				if (req.body.status != null) {
					ticket.status = req.body.status;
				}
				if (req.body.loggedTime != null) {
					ticket.loggedTime = req.body.loggedTime;
				}
				if (req.body.estimatedTime != null) {
					ticket.estimatedTime = req.body.estimatedTime;
				}
				if (req.body.loggedTime != null && req.body.estimatedTime != null) {
					ticket.remainingTime = req.body.estimatedTime - req.body.loggedTime;
				}

				ticket.description = req.body.description;
				ticket.owner = req.body.owner;
				ticket.priority = req.body.priority;
				ticket.type = req.body.type;

				if (validationErrors.length)
					res.status(500).send(validationErrors);

				foundTicket = true;

				user.save(function (err) {
					if (err)
						res.status(500).send(err);

					res.json(req.body);
				});
			}
		});

		if (!foundTicket)
			res.status(404).send();
	});
};

exports.deleteTicket = function (req, res) {
	User.findOne({
		key: req.user.key
	}, function (err, user) {
		var foundTicket = false;

		if (err)
			res.status(500).send(err);

		_.each(user.tickets, function (ticket, ix) {
			if (ticket !== undefined && ticket.key == req.params.ticketId) {
				foundTicket = true;
				user.tickets.splice(ix, 1);
			}
		});

		if (!foundTicket) {
			res.status(404).send();
		} else {
			_.each(user.comments, function (comment, ix) {
				if (comment !== undefined && comment.ticket == req.params.ticketId) {
					user.comments.splice(ix, 1);
				}
			});

			user.save(function (err) {
				if (err)
					res.status(500).send(err);

				res.status(204).json();
			});
		}

	});
};