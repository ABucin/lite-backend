var mongoose = require('mongoose'),
	config = require('./../../config.json'),
	_ = require('underscore')._;

mongoose.connect(config.dbURI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connection to DB established...');
});

var utils = require('../utils/utils'),
	passport = require('passport'),
	Comment = require('../model/comment'),
	Log = require('../model/log'),
	Ticket = require('../model/ticket'),
	User = require('../model/user'),
	Settings = require('../model/settings');

/**
 * Projects.
 */
exports.updateProject = function (oldProject, body, res) {
	User.find({
		project: oldProject
	}, function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(users, function (user) {
				user.project = body.project;
				user.save(function (err) {
					if (err) {
						res.status(500).send(err);
					}
				});
			});
			res.json(body);
		}
	});
};

/**
 * Settings.
 */
exports.getSettings = function (userId, res) {
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else if (user != null) {
			res.json(user.settings);
		}
	});
};

exports.updateSettings = function (userId, settingId, settings, res) {
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(user.settings, function (s) {
				if (s.key == settingId) {
					s.displayUserActivity = settings.displayUserActivity;
					s.displayUserChart = settings.displayUserChart;
					s.displayUserEmail = settings.displayUserEmail;
					s.displayUserRole = settings.displayUserRole;
				}
			});

			user.save(function (err) {
				if (err) {
					res.status(500).send(err);
				} else {
					res.json(settings);
				}
			});
		}
	});
};

exports.updateAllSettings = function (settings, res) {
	User.find(function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(users, function (user) {
				user.settings[0].displayUserEmail = settings.displayUserEmail;
				user.settings[0].displayUserRole = settings.displayUserRole;

				user.save(function (err) {
					if (err) {
						res.status(500).send(err);
					}
				});
			});

			res.json(settings);
		}
	});
};

/**
 * Authentication.
 */
exports.register = function (req, res) {
	User.register(new User({
		key: utils.generateKey(),
		username: req.body.username,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		settings: [{
			key: utils.generateKey(),
			displayUserActivity: true,
			displayUserChart: true,
			displayUserEmail: true,
			displayUserRole: true
	}]
	}), req.body.password, function (err) {
		if (err) {
			console.log("Registration error %s", err);
			res.status(500).send(err);
		} else {
			passport.authenticate('local')(req, res, function () {
				console.log("Registration successful. User %s authenticated.", req.body.username);
				User.findOne({
					'username': req.body.username
				}, function (err, user) {
					if (err) {
						res.status(500).send(err);
					} else {
						res.status(201).send({
							key: user.key,
							username: user.username,
							email: user.email,
							role: user.role,
							projectRole: user.projectRole,
							project: user.project,
							expertise: user.expertise,
							firstName: user.firstName,
							lastName: user.lastName,
							settings: user.settings
						});
					}
				});
			});
		}
	});
};

exports.login = function (username, res) {
	User.findOne({
		'username': username
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send({
				key: user.key,
				username: user.username,
				email: user.email,
				role: user.role,
				projectRole: user.projectRole,
				project: user.project,
				expertise: user.expertise,
				firstName: user.firstName,
				lastName: user.lastName,
				settings: user.settings
			});
		}
	});
};

/**
 * Users.
 */
exports.getAllUsers = function (res) {
	User.find(function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(users);
		}
	});
};

exports.getAllUsersCallback = function (cb) {
	User.find(function (err, users) {
		cb(users);
	});
};

exports.getUser = function (userId, res) {
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json([user]);
		}
	});
};

exports.getUsersWithProject = function (project, res) {
	User.find({
		project: project
	}, function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(users);
		}
	});
};

exports.updateUser = function (userId, data, res) {
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			if (data.project !== undefined) {
				user.project = data.project;
			}
			if (data.firstName !== undefined) {
				user.firstName = data.firstName;
			}
			if (data.lastName !== undefined) {
				user.lastName = data.lastName;
			}
			if (data.email !== undefined) {
				user.email = data.email;
			}
			if (data.expertise !== undefined) {
				user.expertise = data.expertise;
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

/**
 * Tickets.
 */
exports.createTicket = function (userId, ticket, res) {
	var ticketData = {
		key: utils.generateKey(),
		title: ticket.title,
		status: 'created',
		type: ticket.type,
		description: ticket.description,
		loggedTime: ticket.loggedTime,
		estimatedTime: ticket.estimatedTime,
		remainingTime: ticket.estimatedTime,
		owner: ticket.owner,
		priority: ticket.priority
	};

	// save the ticket and check for errors
	User.findOne({
		'key': userId
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

exports.getTickets = function (userId, res) {
	User.findOne({
		'key': userId
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
						if (el.key == ticketId) {

							if (ticket.title != null && ticket.title.length) {
								el.title = ticket.title;
							} else {
								errorResponse.push({
									message: 'Title must be provided.'
								});
							}
							if (ticket.status != null) {
								el.status = ticket.status;
							}
							if (ticket.loggedTime != null) {
								el.loggedTime = ticket.loggedTime;
							}
							if (ticket.estimatedTime != null) {
								el.estimatedTime = ticket.estimatedTime;
							}
							if(ticket.loggedTime != null && ticket.estimatedTime != null) {
								el.remainingTime = ticket.estimatedTime - ticket.loggedTime;
							}
							el.description = ticket.description;
							el.owner = ticket.owner;
							el.priority = ticket.priority;
							el.type = ticket.type;

							if (errorResponse.length) {
								res.status(500).send(errorResponse);
							} else {
								user.save(function (err) {
									if (err) {
										res.status(500).send(err);
									} else {
										res.json(ticket);
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

exports.deleteTicket = function (key, res) {
	User.find().exec(function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(users, function (user) {
				_.each(user.tickets, function (ticket, ix) {
					if (ticket !== undefined && ticket.key == key) {
						user.tickets.splice(ix, 1);
					}
				});

				_.each(user.comments, function (comment, ix) {
					if (comment !== undefined && comment.ticket == key) {
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

/**
 * Comments.
 */
exports.createComment = function (userId, ticket, comment, res) {
	var commentData = {
		key: utils.generateKey(),
		ticket: ticket,
		content: comment.content,
		author: comment.author,
		timestamp: new Date()
	};

	// save the comment and check for errors
	User.findOne({
		'key': userId
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

exports.deleteComment = function (commentId, userId, res) {
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(user.comments, function (comment, ix) {
				if (comment.key == userId) {
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

exports.getComments = function (ticketId, res) {
	User.find().exec(function (err, users) {
		if (err) {
			res.status(500).send(err);
		} else {
			var comments = [];

			_.each(users, function (user) {
				_.each(user.comments, function (comment) {
					if (comment.ticket == ticketId) {
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

exports.updateComment = function (ticketId, ticket, userId, comment, res) {
	// save the comment and check for errors
	User.findOne({
		'key': userId
	}, function (err, user) {
		var errorResponse = [];
		if (err) {
			res.status(500).send(err);
		} else {
			_.each(user.comments, function (c) {
				if (c.key == ticketId && c.ticket == ticket) {

					if (comment.content != null && comment.content.length) {
						c.content = comment.content;
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

/**
 * Logs.
 */
exports.getAllLogs = function (res) {
	User.find()
		.sort('-timestamp')
		.limit(10)
		.exec(function (err, users) {
			if (err) {
				res.status(500).send(err);
			} else {
				var logs = [];

				_.each(users, function (e) {
					logs = _.union(logs, e.logs);
				});

				logs.sort(function (a, b) {
					if (a.timestamp < b.timestamp) return 1;
					if (b.timestamp < a.timestamp) return -1;
					return 0;
				});

				res.json(logs);
			}
		});
};

exports.createLog = function (userId, log, res) {
	var logData = {
		key: utils.generateKey(),
		action: log.action,
		target: log.target,
		targetType: log.targetType,
		comment: log.comment,
		amount: log.amount,
		username: log.username,
		timestamp: new Date()
	};

	// save the log and check for errors
	User.findOne({
		'key': userId
	}, function (err, user) {
		if (err) {
			res.status(500).send(err);
		} else {
			user.logs.push(new Log(logData));

			user.save(function (err) {
				if (err) {
					res.status(500).send(err);
				} else {
					res.json(logData);
				}
			});
		}
	});
};
