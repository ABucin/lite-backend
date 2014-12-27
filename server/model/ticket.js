var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TicketSchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true
	},
	code: {
		type: Number,
		required: true,
		unique: true
	},
	title: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	description: {
		type: String,
		trim: true
	},
	estimatedTime: {
		type: Number,
		default: 0
	},
	loggedTime: {
		type: Number,
		default: 0
	},
	remainingTime: {
		type: Number,
		default: 0
	},
	owner: {
		type: String
	},
	priority: {
		type: String,
		default: "normal"
	}
});

module.exports.schema = TicketSchema;

module.exports = mongoose.model("Ticket", TicketSchema);
