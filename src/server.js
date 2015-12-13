/**
 * Required Node modules.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    passport = require('passport'),
    server = express(),
    router = express.Router(),
    /**
     * Required app-specific modules.
     */
    config = require('./../config.json'),
    utils = require('./utils/population'),
    analyticsService = require('./service/analytics'),
    authService = require('./service/auth'),
    commentsService = require('./service/comments'),
    logsService = require('./service/logs'),
    settingsService = require('./service/settings'),
    ticketsService = require('./service/tickets'),
    usersService = require('./service/users'),
    /**
     * Constants.
     */
    RESOURCE = {
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
server.use(cors());
// Set the path to the index.html file.
server.use(express.static(__dirname + "./../"));
server.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(config.root + config.apiVersion, router);

// Specify port and ip address of src
server.listen(config.port, config.ip);

console.log('LITE backend server started. Listening on port %s ...', config.port);

mongoose.connect(config.dbURI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
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
router.route(RESOURCE.USERS + '/:id/tickets/:ticketId/comments')
    .post(authService.isAuthenticated, commentsService.createComment);

router.route(RESOURCE.COMMENTS + '/:id')
    .get(authService.isAuthenticated, commentsService.getComment)
    .put(authService.isAuthenticated, commentsService.updateComment)
    .delete(authService.isAuthenticated, commentsService.deleteComment);

/**
 * Log routes.
 */
router.route(RESOURCE.LOGS)
    .get(authService.isAuthenticated, logsService.getAllLogs);
router.route(RESOURCE.USERS + '/:id/logs')
    .post(authService.isAuthenticated, logsService.createLog);

/**
 * Settings routes.
 */
router.route(RESOURCE.USERS + '/:id/settings')
    .get(authService.isAuthenticated, settingsService.getSettings)
    .put(authService.isAuthenticated, settingsService.updateSettings);

/**
 * Ticket routes.
 */
router.route(RESOURCE.USERS + '/:id/tickets')
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
