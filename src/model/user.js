var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    Comment = require('./comment'),
    Log = require('./log'),
    Ticket = require('./ticket'),
    Settings = require('./settings');

var UserSchema = new Schema({
    _id: {type: String},
    email: {type: String, required: true, unique: true},
    firstName: String,
    lastName: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, select: false},
    role: {type: String, default: "user"},
    projectRole: {type: String, default: "developer"},
    project: {type: String, default: "unassigned"},
    expertise: String,
    _tickets: [{type: Schema.Types.ObjectId, ref: "Ticket"}],
    _logs: [{type: Schema.Types.ObjectId, ref: "Log"}],
    _comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
    settings: {type: Settings.schema}
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

/**
 * Checks the provided password with the one stored for this user.
 * @param password provided password
 * @param done callback
 */
UserSchema.methods.verifyPassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return done(err);

        done(null, isMatch);
    });
};

module.exports = mongoose.model("User", UserSchema);
