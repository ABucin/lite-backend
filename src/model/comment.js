var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	_id: {
		type: String
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
