var config = new require('../../config.json');
var baseURL = config.host + ':' + config.port + config.root + config.version;
var superagent = new require('superagent');
var prefix = new require('superagent-prefix')(baseURL);
//var mongoose = new require('mongoose');
//
//exports.connToDB = function (done) {
//    if (mongoose.connection.db)
//        return done();
//
//    var db = mongoose.connect(config.db, done);
//
//    db.on('connected', function () {
//        console.log('Connection to DB established...');
//    });
//
//    db.on('error', function (err) {
//        console.log(err);
//    });
//};
//
exports.urlPrefix = prefix;