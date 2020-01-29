import mongoose from 'mongoose';

const TokenSchema: mongoose.Schema = new mongoose.Schema({
  tokenId: String,
  userId: String,
});

mongoose.model('Token', TokenSchema);