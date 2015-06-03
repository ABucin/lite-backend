/**
 * This script populates the issue tracker database with some dummy data so that its functionality can be tested.
 */

/**
 * Dependent modules.
 */
var mongoose = require('mongoose'),
	utils = require('./utils'),
	Comment = require('../model/comment'),
	Log = require('../model/log'),
	Ticket = require('../model/ticket'),
	User = require('../model/user'),
	Settings = require('../model/settings');

/**
 * Main DB population method.
 */
exports.populateDb = function () {

	/**
	 * Flushes all collections before adding the default data.
	 */
	Settings.collection.drop();
	Log.collection.drop();
	Ticket.collection.drop();
	Comment.collection.drop();
	User.collection.drop();

	/**
	 * Variable initializations.
	 */
	var code = 0,
		userTickets = [],
		user2Tickets = [],
		userLogs = [],
		user2Logs = [],
		userComments = [],
		user2Comments = [],
		usernames = ["abucin", "psmith"],
		priorities = ["minor", "standard", "major"],
		yesterday = new Date();

	var TICKET_TYPE = {
		BUG: "bug",
		TASK: "task"
	};

	var TICKET_STATUS = {
		OPEN: "open",
		IN_PROGRESS: "inProgress",
		TESTING: "testing",
		DONE: "done"
	};

	yesterday.setDate(yesterday.getDate() - 1);

	/**
	 * Generates a ticket.
	 */
	var generateTicket = function (tickets, title, status, type, description, owner, priority, estimatedTime, loggedTime) {
		return tickets.push({
			key: utils.generateKey(),
			code: ++code,
			title: title,
			status: status,
			type: type,
			description: description,
			owner: owner,
			priority: priority,
			estimatedTime: estimatedTime,
			loggedTime: loggedTime,
			remainingTime: estimatedTime - loggedTime
		});
	};

	/**
	 * Generates a settings object for a user.
	 */
	var generateSettings = function () {
		return new Settings({
			_id: mongoose.Types.ObjectId(),
			key: utils.generateKey(),
			displayUserActivity: true,
			displayUserChart: true,
			displayUserEmail: true,
			displayUserRole: true
		});
	};

	/**
	 * Generates a ticket comment.
	 */
	var generateComment = function (comments, content, author, ticketKey) {
		return comments.push({
			key: utils.generateKey(),
			content: content,
			author: author,
			ticket: ticketKey
		});
	};

	/**
	 * Generates a log entry.
	 */
	var generateLog = function (logs, action, amount, target, targetType, comment, username, timestamp) {
		return logs.push({
			key: utils.generateKey(),
			action: action,
			amount: amount || 0,
			target: target,
			targetType: targetType,
			comment: comment || "",
			username: username,
			timestamp: timestamp || new Date()
		});
	};

	var generateUser = function (key, username, password, email, firstName, lastName, role, projectRole, project, expertise, tickets, logs, comments, settingsId) {
		return new User({
			_id: mongoose.Types.ObjectId(),
			key: key,
			username: username,
			password: password,
			email: email,
			firstName: firstName,
			lastName: lastName,
			role: role,
			projectRole: projectRole,
			project: project,
			expertise: expertise,
			tickets: tickets,
			logs: logs,
			settings: settingsId,
			comments: comments
		});
	};

	/**
	 * Dummy-data generation.
	 */
	generateTicket(userTickets, "Plan Review Meeting", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.TASK, "This Thursday at 10:00.", usernames[0], priorities[1], 10, 20);
	generateTicket(userTickets, "Add Colour Palette", TICKET_STATUS.TESTING, TICKET_TYPE.TASK, "Create a colour palette for the website.", "", priorities[2], 12, 12);
	generateTicket(userTickets, "Remove Redundant Tests", TICKET_STATUS.DONE, TICKET_TYPE.TASK, "Remove tests that are not used.", usernames[0], priorities[0], 10, 5);
	generateTicket(userTickets, "Fix CSS Button Padding", TICKET_STATUS.DONE, TICKET_TYPE.BUG, "The login button has extra padding.", usernames[0], priorities[0], 10, 20);
	generateTicket(userTickets, "Fix Responsive Menu", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.BUG, "The menu needs to be made responsive.", usernames[0], priorities[0], 15, 10);
	generateTicket(userTickets, "Remove Menu Padding", TICKET_STATUS.TESTING, TICKET_TYPE.BUG, "The main menu has some extra padding that interferes with the responsiveness of the page.", usernames[0], priorities[0], 5, 8);

	generateTicket(user2Tickets, "Test Batch Script", TICKET_STATUS.TESTING, TICKET_TYPE.TASK, "The deployment script should be tested.", usernames[1], priorities[1], 25, 13);
	generateTicket(user2Tickets, "Fix Missing Authentication Header", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.BUG, "Add the missing header.", usernames[1], priorities[2], 5, 26);
	generateTicket(user2Tickets, "Fix Login Page CSS", TICKET_STATUS.DONE, TICKET_TYPE.BUG, "Fix Login Page CSS.", usernames[1], priorities[2], 15, 23);

	generateComment(userComments, "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia.", usernames[0], userTickets[0].key);
	generateComment(userComments, "That is correct. I will do it soon.", usernames[0], userTickets[0].key);

	generateComment(user2Comments, "Also, please update the title to something more accurate.", usernames[1], user2Tickets[0].key);

	generateLog(userLogs, "comment", null, "1", TICKET_TYPE.TASK, userComments[0].content, usernames[0]);
	generateLog(userLogs, "clock-o", 3, "2", TICKET_TYPE.TASK, null, usernames[0], yesterday);
	generateLog(userLogs, "comment", null, "3", TICKET_TYPE.BUG, userComments[1].content, usernames[0]);

	generateLog(user2Logs, "comment", null, "3", TICKET_TYPE.BUG, user2Comments[0].content, usernames[1]);
	generateLog(user2Logs, "clock-o", 4, "6", TICKET_TYPE.TASK, null, usernames[1]);
	generateLog(user2Logs, "clock-o", 6, "6", TICKET_TYPE.TASK, null, usernames[1], yesterday);

	var setting = generateSettings();

	setting.save(function (err) {

		if (err)
			return console.error(err); // we should handle this

		var user = generateUser(123, usernames[0], usernames[0], "abucin@gmail.com", "Andrei", "Bucin", "admin", "tester", "issue-tracker", "Java, PHP, JavaScript, Web Design.", userTickets, userLogs, userComments, setting.id),
			user2 = generateUser(124, usernames[1], usernames[1], "psmith@gmail.com", "Peter", "Smith", "user", "developer", "unassigned", "JavaScript, HTML5, CSS3.", user2Tickets, user2Logs, user2Comments, setting.id);

		user.save(function (err) {
			if (err)
				return console.error(err); // we should handle this

			user2.save(function (err) {
				if (err)
					return console.error(err); // we should handle this
			});

		});
	});

	console.log('Data population complete...');
};
