/**
 * Required Node modules.
 */
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var mongoose = new require('mongoose');
var morgan = require('morgan');
var passport = require('passport');
var server = express();
var router = express.Router();
/**
 * Required app-specific modules.
 */
var config = new require('./../config.json');
var utils = require('./utils/population');
var analyticsService = require('./service/analytics');
var authService = require('./service/auth');
var commentsService = require('./service/comments');
var logsService = require('./service/logs');
var settingsService = require('./service/settings');
var ticketsService = require('./service/tickets');
var usersService = require('./service/users');
/**
 * Constants.
 */
var RESOURCE = {
    AUTH: "/auth",
    SETTINGS: "/settings",
    TICKETS: "/tickets",
    USERS: "/users",
    COMMENTS: "/comments",
    ANALYTICS: "/analytics",
    LOGS: "/logs"
};

/**
 * Load Express modules.
 */
server.use(cookieParser());
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());
server.use(morgan('dev'));
server.use(cors());
// Set the path to the index.html file.
server.use(express.static(__dirname + "./../"));
server.use(passport.initialize());
server.use(config.root + config.version, router);

server.listen(config.port);

console.log('LITE backend server started. Listening on port %s ...', config.port);

mongoose.connect(config.db, function (err) {
    if (err) throw err;
});

mongoose.connection.once('open', function () {
    console.log('Connection to DB established...');
});

// Add default data to database.
utils.populateDb();

/**
 * Analytics routes.
 */
router.route(RESOURCE.ANALYTICS + '?:type')
    .get(authService.isAuthenticated, analyticsService.getChart);

/**
 * Authentication routes.
 */
router.route(RESOURCE.AUTH + '/register')
    .post(authService.register);

router.route(RESOURCE.AUTH + '/login')
    .post(authService.login);

router.route(RESOURCE.AUTH + '/logout')
    .post(authService.logout);

/**
 * Comment routes.
 */
router.route(RESOURCE.TICKETS + '/:id/comments')
    .post(authService.isAuthenticated, commentsService.createComment);

router.route(RESOURCE.COMMENTS + '/:id')
    .get(authService.isAuthenticated, commentsService.getComment)
    .put(authService.isAuthenticated, commentsService.updateComment)
    .delete(authService.isAuthenticated, commentsService.deleteComment);

/**
 * Log routes.
 */
router.route(RESOURCE.LOGS)
    .get(authService.isAuthenticated, logsService.getAllLogs)
    .post(authService.isAuthenticated, logsService.createLog);

/**
 * Settings routes.
 */
router.route(RESOURCE.SETTINGS)
    .get(authService.isAuthenticated, settingsService.getSettings)
    .put(authService.isAuthenticated, settingsService.updateSettings);

/**
 * Ticket routes.
 */
router.route(RESOURCE.TICKETS)
    .get(authService.isAuthenticated, ticketsService.getTickets)
    .post(authService.isAuthenticated, ticketsService.createTicket);

router.route(RESOURCE.TICKETS + '/:id')
    .put(authService.isAuthenticated, ticketsService.updateTicket)
    .delete(authService.isAuthenticated, ticketsService.deleteTicket);

/**
 * User routes.
 */
router.route(RESOURCE.USERS + '?:project')
    .get(authService.isAuthenticated, usersService.getAllUsers);

router.route(RESOURCE.USERS + '/:id')
    .get(authService.isAuthenticated, usersService.getUser)
    .put(authService.isAuthenticated, usersService.updateUser);
