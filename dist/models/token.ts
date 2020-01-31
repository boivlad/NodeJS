import mongoose from 'mongoose';

export interface IToken extends mongoose.Document {
  tokenId?: string,
  userId?: string,
}

const TokenSchema: mongoose.Schema = new mongoose.Schema({
  tokenId: String,
  userId: String,
});

mongoose.model('Token', TokenSchema);
