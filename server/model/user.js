var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose'),
	utils = require('../utils/utils'),
	Comment = require('../model/comment'),
	Log = require('../model/log'),
	Ticket = require('../model/ticket'),
	Settings = require('../model/settings');

var UserSchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true,
		default: utils.generateKey()
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	firstName: {
		type: String
	},
	lastName: {
		type: String
	},
	username: {
		type: String
	},
	password: {
		type: String
	},
	salt: {
		type: String,
		required: true
	},
	hash: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
		default: "user"
	},
	projectRole: {
		type: String,
		required: true,
		default: "developer"
	},
	project: {
		type: String,
		default: "unassigned"
	},
	expertise: {
		type: String
	},
	tickets: [Ticket.schema],
	logs: [Log.schema],
	comments: [Comment.schema],
	settings: [Settings.schema]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
