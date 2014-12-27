/**
 * Required Express modules.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    server = express(),
    router = express.Router(),
    /**
     * Required JS files.
     */
    config = require('./config.json'),
    utils = require('./utils/population'),
    persistenceService = require('./service/persistence'),
    analyticsService = require('./service/analytics'),
    User = require('./model/user');
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
    secret: config.secret
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(config.root, router);

// Specify port and ip address of server
server.listen(config.port, config.ip);

console.log('Application server started. Listening on port %s ...', config.port);

// Add default data to database.
utils.populateDb();

/**
 * Authentication config.
 */
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * User routes.
 */
router.route('/users/register')
    .post(function (req, res) {
        persistenceService.register(req, res);
    });

router.route('/users/login')
    .post(passport.authenticate('local'), function (req, res) {
        persistenceService.login(req.body.username, res);
    });

router.route('/users/logout')
    .post(function (req, res) {
        req.logout();
        res.status(200).send();
    });

router.route('/users?:project')
    .get(function (req, res) {
        if (req.query.project === undefined) {
            persistenceService.getAllUsers(res);
        } else {
            persistenceService.getUsersWithProject(req.query.project, res);
        }
    });

router.route('/users/:userId')
    .get(function (req, res) {
        persistenceService.getUser(req.params.userId, res);
    })
    .put(function (req, res) {
        persistenceService.updateUser(req.params.userId, req.body, res);
    });

/**
 * Comment routes.
 */
router.route('/tickets/:ticketId/comments')
    .get(function (req, res) {
        persistenceService.getComments(req.params.ticketId, res);
    });

router.route('/users/:userId/tickets/:ticketId/comments')
    .post(function (req, res) {
        persistenceService.createComment(req.params.userId, req.params.ticketId, req.body, res);
    });

router.route('/users/:userId/tickets/:ticketKey/comments/:commentId')
    .put(function (req, res) {
        persistenceService.updateComment(req.params.commentId, req.params.ticketKey, req.params.userId, req.body, res);
    });

router.route('/users/:userId/comments/:commentId')
    .delete(function (req, res) {
        persistenceService.deleteComment(req.params.commentId, req.params.userId, res);
    });

/**
 * Ticket routes.
 */
router.route('/users/:userId/tickets')
    .post(function (req, res) {
        persistenceService.createTicket(req.params.userId, req.body, res);
    })
    .get(function (req, res) {
        persistenceService.getTickets(req.params.userId, res);
    });

router.route('/tickets/:ticketId')
    .put(function (req, res) {
        persistenceService.updateTicket(req.params.ticketId, req.body, res);
    })
    .delete(function (req, res) {
        persistenceService.deleteTicket(req.params.ticketId, res);
    });

/**
 * Log routes.
 */
router.route('/logs')
    .get(function (req, res) {
        persistenceService.getAllLogs(res);
    });

router.route('/users/:userId/logs')
    .post(function (req, res) {
        persistenceService.createLog(req.params.userId, req.body, res);
    });

/**
 * Analytics routes.
 */
router.route('/analytics?:type')
    .get(function (req, res) {
        analyticsService.getChart(req.query.type, res);
    });

/**
 * Settings routes.
 */
router.route('/users/:userId/settings')
    .get(function (req, res) {
        persistenceService.getSettings(req.params.userId, res);
    });

router.route('/settings')
    .put(function (req, res) {
        persistenceService.updateAllSettings(req.body, res);
    });

router.route('/users/:userId/settings/:settingId')
    .put(function (req, res) {
        persistenceService.updateSettings(req.params.userId, req.params.settingId, req.body, res);
    });

/**
 * Project routes.
 */
router.route('/projects/:projectId')
    .put(function (req, res) {
        persistenceService.updateProject(req.params.projectId, req.body, res);
    });
