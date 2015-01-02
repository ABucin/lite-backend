/**
 * This script populates the issue tracker database with some dummy data so that its functionality can be tested.
 */

/**
 * Dependent modules.
 */
var utils = require('./utils'),
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
		return [{
			key: utils.generateKey(),
			displayUserActivity: true,
			displayUserChart: true,
			displayUserEmail: true,
			displayUserRole: true
		}];
	};

	/**
	 * Generates a ticket comment.
	 */
	var generateComment = function (comments, content, ticketKey) {
		return comments.push({
			key: utils.generateKey(),
			content: content,
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
			amount: amount != null ? amount : 0,
			target: target,
			targetType: targetType,
			comment: comment != null ? comment : "",
			username: username,
			timestamp: timestamp != null ? timestamp : new Date()
		});
	};

	var generateUser = function (key, username, email, firstName, lastName, role, projectRole, project, expertise, tickets, logs, comments, settings) {
		return new User({
			key: key,
			username: username,
			email: email,
			firstName: firstName,
			lastName: lastName,
			salt: null,
			hash: null,
			role: role,
			projectRole: projectRole,
			project: project,
			expertise: expertise,
			tickets: tickets,
			settings: settings,
			logs: logs,
			comments: comments
		});
	};

	/**
	 * Dummy-data generation.
	 */
	generateTicket(userTickets, "Plan Review Meeting", "inProgress", "task", "This Thursday at 10:00.", usernames[0], priorities[1], 10, 20);
	generateTicket(userTickets, "Add Colour Palette", "testing", "task", "Create a colour palette for the website.", "", priorities[2], 12, 12);
	generateTicket(userTickets, "Remove Redundant Tests", "done", "task", "Remove tests that are not used.", usernames[0], priorities[0], 10, 5);
	generateTicket(userTickets, "Fix CSS Button Padding", "done", "bug", "The login button has extra padding.", usernames[0], priorities[0], 10, 20);
	generateTicket(userTickets, "Fix Responsive Menu", "inProgress", "bug", "The menu needs to be made responsive.", usernames[0], priorities[0], 15, 10);
	generateTicket(userTickets, "Remove Menu Padding", "testing", "bug", "The main menu has some extra padding that interferes with the responsiveness of the page.", usernames[0], priorities[0], 5, 8);

	generateTicket(user2Tickets, "Test Batch Script", "testing", "task", "The deployment script should be tested.", usernames[1], priorities[1], 25, 13);
	generateTicket(user2Tickets, "Fix Missing Authentication Header", "inProgress", "bug", "Add the missing header.", usernames[1], priorities[2], 5, 26);
	generateTicket(user2Tickets, "Fix Login Page CSS", "done", "bug", "Fix Login Page CSS.", usernames[1], priorities[2], 15, 23);

	generateComment(userComments, "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia.", userTickets[0].key);
	generateComment(userComments, "That is correct. I will do it soon.", userTickets[0].key);

	generateComment(user2Comments, "Also, please update the title to something more accurate.", user2Tickets[0].key);

	generateLog(userLogs, "comment", null, "1", "task", userComments[0].content, usernames[0], null);
	generateLog(userLogs, "clock-o", 3, "2", "task", null, usernames[0], yesterday);
	generateLog(userLogs, "comment", null, "3", "bug", userComments[1].content, usernames[0], null);

	generateLog(user2Logs, "comment", null, "3", "bug", user2Comments[0].content, usernames[1], null);
	generateLog(user2Logs, "clock-o", 4, "6", "task", null, usernames[1], null);
	generateLog(user2Logs, "clock-o", 6, "6", "task", null, usernames[1], yesterday);

	var user = generateUser(123, usernames[0], "abucin@gmail.com", "Andrei", "Bucin", "admin", "tester", "issue-tracker", "Java, PHP, JavaScript, Web Design.", userTickets, userLogs, userComments, generateSettings()),
		user2 = generateUser(124, usernames[1], "psmith@gmail.com", "Peter", "Smith", "user", "developer", "unassigned", "JavaScript, HTML5, CSS3.", user2Tickets, user2Logs, user2Comments, generateSettings());

	/**
	 * Password generation.
	 */
	user.setPassword(usernames[0], function () {
		user.save(function (err) {
			if (err) {
				return console.error(err); // we should handle this
			} else {
				user2.setPassword(usernames[1], function () {
					user2.save(function (err) {
						if (err) {
							return console.error(err); // we should handle this
						}
					});
				});
			}
		});
	});

	console.log('Data population complete...');
};
