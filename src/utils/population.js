/**
 * This script populates the issue tracker database with some dummy data so that its functionality can be tested.
 */

/**
 * Dependent modules.
 */
var mongoose = require('mongoose'),
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
        userLogs = [],
        user2Logs = [],
        comments = [],
        users = [],
        tickets = [],
        usernames = ["abucin", "psmith"],
        yesterday = new Date();

    var TICKET_TYPE = {
        BUG: "bug",
        TASK: "task"
    };

    var TICKET_PRIORITY = {
        MINOR: "bug",
        STANDARD: "task",
        MAJOR: "major"
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
    var generateTicket = function (title, status, type, description, owner, priority, estimatedTime, loggedTime) {
        return tickets.push({
            _id: mongoose.Types.ObjectId(),
            code: code++,
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
            displayUserActivity: true,
            displayUserChart: true,
            displayUserEmail: true,
            displayUserRole: true
        });
    };

    /**
     * Generates a ticket comment.
     */
    var generateComment = function (user, content, author, ticketKey) {
        var id = mongoose.Types.ObjectId();

        user.comments.push(id);

        comments.push(
            new Comment({
                _id: id,
                content: content,
                author: author,
                ticket: ticketKey
            })
        );
    };

    /**
     * Generates a log entry.
     */
    var generateLog = function (logs, action, amount, target, targetType, comment, username, timestamp) {
        return logs.push({
            _id: mongoose.Types.ObjectId(),
            action: action,
            amount: amount,
            target: target,
            targetType: targetType,
            comment: comment,
            username: username,
            timestamp: timestamp
        });
    };

    var generateUser = function (username, password, email, firstName, lastName, role, projectRole, project, expertise, tickets, logs, comments, settings) {
        var user = new User({
            _id: mongoose.Types.ObjectId(),
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
            settings: settings,
            comments: []
        });

        users.push(user);

        return user;
    };

    /**
     * Dummy-data generation.
     */
    generateTicket("Plan Review Meeting", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.TASK, "This Thursday at 10:00.", usernames[0], TICKET_PRIORITY.STANDARD, 10, 20, 1);
    generateTicket("Add Colour Palette", TICKET_STATUS.TESTING, TICKET_TYPE.TASK, "Create a colour palette for the website.", "", TICKET_PRIORITY.MAJOR, 12, 12);
    generateTicket("Remove Redundant Tests", TICKET_STATUS.DONE, TICKET_TYPE.TASK, "Remove tests that are not used.", usernames[0], TICKET_PRIORITY.MINOR, 10, 5);
    generateTicket("Fix CSS Button Padding", TICKET_STATUS.DONE, TICKET_TYPE.BUG, "The login button has extra padding.", usernames[0], TICKET_PRIORITY.MINOR, 10, 20);
    generateTicket("Fix Responsive Menu", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.BUG, "The menu needs to be made responsive.", usernames[0], TICKET_PRIORITY.MINOR, 15, 10);
    generateTicket("Remove Menu Padding", TICKET_STATUS.TESTING, TICKET_TYPE.BUG, "The main menu has some extra padding that interferes with the responsiveness of the page.", usernames[0], TICKET_PRIORITY.MINOR, 5, 8);

    generateTicket("Test Batch Script", TICKET_STATUS.TESTING, TICKET_TYPE.TASK, "The deployment script should be tested.", usernames[1], TICKET_PRIORITY.STANDARD, 25, 13);
    generateTicket("Fix Missing Authentication Header", TICKET_STATUS.IN_PROGRESS, TICKET_TYPE.BUG, "Add the missing header.", usernames[1], TICKET_PRIORITY.MAJOR, 5, 26);
    generateTicket("Fix Login Page CSS", TICKET_STATUS.DONE, TICKET_TYPE.BUG, "Fix Login Page CSS.", usernames[1], TICKET_PRIORITY.MAJOR, 15, 23);

    generateLog(userLogs, "comment", null, "1", TICKET_TYPE.TASK, null, usernames[0]);
    generateLog(userLogs, "clock-o", 3, "2", TICKET_TYPE.TASK, null, usernames[0], yesterday);
    generateLog(userLogs, "comment", null, "3", TICKET_TYPE.BUG, null, usernames[0]);

    generateLog(user2Logs, "comment", null, "3", TICKET_TYPE.BUG, null, usernames[1]);
    generateLog(user2Logs, "clock-o", 4, "6", TICKET_TYPE.TASK, null, usernames[1]);
    generateLog(user2Logs, "clock-o", 6, "6", TICKET_TYPE.TASK, null, usernames[1], yesterday);

    var setting = generateSettings();
    generateUser(usernames[0], usernames[0], "abucin@gmail.com", "Andrei", "Bucin", "admin", "tester", "issue-tracker", "Java, PHP, JavaScript, Web Design.", userLogs, setting);
    generateUser(usernames[1], usernames[1], "psmith@gmail.com", "Peter", "Smith", "user", "developer", "unassigned", "JavaScript, HTML5, CSS3.", user2Logs, setting);

    generateComment(users[0], "That is correct. I will do it soon.", usernames[0], tickets[1]._id);
    generateComment(users[0], "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia.", usernames[0], tickets[0]._id);

    generateComment(users[1], "Also, please update the title to something more accurate.", usernames[1], tickets[8]._id);

    Ticket.create(tickets, function (err) {
        if (err) {
            return console.error(err);
        }
    });

    Comment.create(comments, function (err) {
        if (err) {
            return console.error(err);
        }
    });

    User.create(users, function (err) {
        if (err) {
            return console.error(err);
        }
    });

    console.log('Data population complete...');
};
