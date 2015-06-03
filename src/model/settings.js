var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
	_id: {
		type: String
	},
	key: {
		type: String,
		required: true,
		unique: true
	},
	displayUserActivity: {
		type: Boolean,
		default: false
	},
	displayUserChart: {
		type: Boolean,
		default: false
	},
	displayUserRole: {
		type: Boolean,
		default: false
	},
	displayUserEmail: {
		type: Boolean,
		default: false
	}
});

module.exports.schema = SettingsSchema;

module.exports = mongoose.model("Settings", SettingsSchema);
