import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
	tokenId: String,
	userId: String,
});

mongoose.model('Token', TokenSchema);