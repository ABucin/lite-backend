/**
 * Required Node modules.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    session = require('express-session'),
    passport = require('passport'),
    server = express(),
    router = express.Router(),
    /**
     * Required app-specific modules.
     */
    config = require('./../config.json'),
    utils = require('./utils/population'),
    persistenceService = require('./service/persistence'),
    analyticsService = require('./service/analytics'),
    authService = require('./service/auth'),
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
    secret: config.secret,
    saveUninitialized: true,
    resave: true
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(config.root, router);

// Specify port and ip address of src
server.listen(config.port, config.ip);

console.log('Application server started. Listening on port %s ...', config.port);

// Add default data to database.
utils.populateDb();

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
    .get(authService.isAuthenticated, function (req, res) {
        if (req.query.project === undefined) {
            persistenceService.getAllUsers(res);
        } else {
            persistenceService.getUsersWithProject(req.query.project, res);
        }
    });

router.route('/users/:userId')
    .get(authService.isAuthenticated, function (req, res) {
        persistenceService.getUser(req.params.userId, res);
    })
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateUser(req.params.userId, req.body, res);
    });

/**
 * Comment routes.
 */
router.route('/tickets/:ticketId/comments')
    .get(authService.isAuthenticated, function (req, res) {
        persistenceService.getComments(req.params.ticketId, res);
    })
    .post(authService.isAuthenticated, function (req, res) {
        persistenceService.createComment(req.user.key, req.params.ticketId, req.body, res);
    });

router.route('/tickets/:ticketKey/comments/:commentId')
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateComment(req.params.commentId, req.params.ticketKey, req.user.key, req.body, res);
    });

router.route('/comments/:commentId')
    .delete(authService.isAuthenticated, function (req, res) {
        persistenceService.deleteComment(req.params.commentId, req.user.key, res);
    });

/**
 * Ticket routes.
 */
router.route('/tickets')
    .post(authService.isAuthenticated, function (req, res) {
        persistenceService.createTicket(req.user.key, req.body, res);
    })
    .get(authService.isAuthenticated, function (req, res) {
        persistenceService.getTickets(req.user.key, res);
    });

router.route('/tickets/:ticketId')
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateTicket(req.params.ticketId, req.body, res);
    })
    .delete(authService.isAuthenticated, function (req, res) {
        persistenceService.deleteTicket(req.params.ticketId, res);
    });

/**
 * Log routes.
 */
router.route('/logs')
    .get(authService.isAuthenticated, function (req, res) {
        persistenceService.getAllLogs(res);
    })
    .post(authService.isAuthenticated, function (req, res) {
        persistenceService.createLog(req.user.key, req.body, res);
    });

/**
 * Analytics routes.
 */
router.route('/analytics?:type')
    .get(authService.isAuthenticated, function (req, res) {
        analyticsService.getChart(req.query.type, res);
    });

/**
 * Settings routes.
 */
router.route('/settings')
    .get(authService.isAuthenticated, function (req, res) {
        persistenceService.getSettings(req.user.key, res);
    })
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateAllSettings(req.body, res);
    });

router.route('/settings/:settingId')
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateSettings(req.user.key, req.params.settingId, req.body, res);
    });

/**
 * Project routes.
 */
router.route('/projects/:projectId')
    .put(authService.isAuthenticated, function (req, res) {
        persistenceService.updateProject(req.params.projectId, req.body, res);
    });
