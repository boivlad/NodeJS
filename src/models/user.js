import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true,
	},

	email: {
		type: String,
		required: true,
	},

	password: {
		type: String,
		required: true,
	},

	phone: {
		type: String,
		required: true,
	},

	status: {
		type: String,
		default: 0,
	}
});

mongoose.model('User', UserSchema);