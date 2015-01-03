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
    projectsService = require('./service/projects'),
    settingsService = require('./service/settings'),
    ticketsService = require('./service/tickets'),
    usersService = require('./service/users');

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
server.use(config.root, router);

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
router.route('/analytics?:type')
    .get(authService.isAuthenticated, analyticsService.getChart);

/**
 * Authentication routes.
 */
router.route('/auth/register')
    .post(authService.register);

router.route('/auth/login')
    .post(passport.authenticate('local'), authService.login);

router.route('/auth/logout')
    .post(authService.logout);

/**
 * Comment routes.
 */
router.route('/tickets/:ticketId/comments')
    .get(authService.isAuthenticated, commentsService.getComments)
    .post(authService.isAuthenticated, commentsService.createComment);

router.route('/comments/:commentId')
    .put(authService.isAuthenticated, commentsService.updateComment)
    .delete(authService.isAuthenticated, commentsService.deleteComment);

/**
 * Log routes.
 */
router.route('/logs')
    .get(authService.isAuthenticated, logsService.getAllLogs)
    .post(authService.isAuthenticated, logsService.createLog);

/**
 * Project routes.
 */
router.route('/projects/:projectId')
    .put(authService.isAuthenticated, projectsService.updateProject);

/**
 * Settings routes.
 */
router.route('/settings')
    .get(authService.isAuthenticated, settingsService.getSettings)
    .put(authService.isAuthenticated, settingsService.updateAllSettings);

router.route('/settings/:settingId')
    .put(authService.isAuthenticated, settingsService.updateSettings);

/**
 * Ticket routes.
 */
router.route('/tickets')
    .post(authService.isAuthenticated, ticketsService.createTicket)
    .get(authService.isAuthenticated, ticketsService.getTickets);

router.route('/tickets/:ticketId')
    .put(authService.isAuthenticated, ticketsService.updateTicket)
    .delete(authService.isAuthenticated, ticketsService.deleteTicket);

/**
 * User routes.
 */
router.route('/users?:project')
    .get(authService.isAuthenticated, usersService.getAllUsers);

router.route('/users/:userId')
    .get(authService.isAuthenticated, usersService.getUser)
    .put(authService.isAuthenticated, usersService.updateUser);
