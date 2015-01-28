var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true
	},
	content: {
		type: String,
		required: true
	},
	ticket: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now
	},
	isEdited: {
		type: Boolean,
		default: false
	}
});

module.exports.schema = CommentSchema;

module.exports = mongoose.model("Comment", CommentSchema);
