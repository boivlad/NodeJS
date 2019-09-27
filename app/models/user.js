const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: 0
	}
});
const Product = mongoose.model('User', UserSchema);