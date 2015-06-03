var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt-nodejs'),
	utils = require('../utils/utils'),
	Comment = require('../model/comment'),
	Log = require('../model/log'),
	Ticket = require('../model/ticket'),
	Settings = require('../model/settings');

var UserSchema = new Schema({
	_id: {
		type: String
	},
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
	firstName: String,
	lastName: String,
	username: String,
	password: {
		type: String,
		select: false
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
	expertise: String,
	tickets: [Ticket.schema],
	logs: [Log.schema],
	comments: [Comment.schema],
	settings: {
		type: Schema.Types.ObjectId,
		ref: "Settings"
	}
});

// Execute before each user.save() call
UserSchema.pre('save', function (done) {
	var user = this;

	// Break out if the password hasn't changed
	if (!user.isModified('password')) return done();

	// Password changed so we need to hash it
	bcrypt.genSalt(5, function (err, salt) {
		if (err) return done(err);

		bcrypt.hash(user.password, salt, null, function (err, hash) {
			if (err) return done(err);
			user.password = hash;
			done();
		});
	});
});

UserSchema.methods.verifyPassword = function (password, done) {
	bcrypt.compare(password, this.password, function (err, isMatch) {
		if (err) return done(err);
		done(null, isMatch);
	});
};

module.exports = mongoose.model("User", UserSchema);
