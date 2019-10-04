import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import {
	app
} from '../config';
const {
	secret,
	tokens
} = app.jwt;
import mongoose from 'mongoose';
const Token = mongoose.model('Token');

const generateAccessToken = (userId) => {
	const payload = {
		userId,
		type: tokens.access.type,
	};

	const options = {
		expiresIn: tokens.access.expiresIn
	};
	return jwt.sign(payload, secret, options);
};

const generateRefreshToken = () => {
	const payload = {
		id: uuid(),
		type: tokens.refresh.type,
	};

	const options = {
		expiresIn: tokens.refresh.expiresIn
	};
	return {
		id: payload.id,
		token: jwt.sign(payload, secret, options),
	};
};

const replaceDbRefreshToken = (tokenId, userId) => (
	Token.findByIdAndRemove(userId)
	.exec()
	.then(() => Token.create({
		tokenId,
		userId
	})));

export default {
	generateAccessToken,
	generateRefreshToken,
	replaceDbRefreshToken,
};