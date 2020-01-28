import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config';

const { secret, tokens } = config.jwt;

const Token = mongoose.model('Token');

const generateAccessToken = (userId: string): string  => {
	const payload: object = {
		userId,
		type: tokens.access.type,
	};

	const options: object = { expiresIn: tokens.access.expiresIn };
	return jwt.sign(payload, secret, options);
};

const generateRefreshToken = (): any => {
	const payload = {
		id: uuid(),
		type: tokens.refresh.type,
	};

	const options = { expiresIn: tokens.refresh.expiresIn };
	return {
		id: payload.id,
		token: jwt.sign(payload, secret, options),
	};
};

const replaceDbRefreshToken = async (tokenId: string, userId: string): Promise<void> => {
	await Token.findByIdAndRemove(userId);
	await Token.create({
		tokenId,
		userId,
	});
};

export default {
	generateAccessToken,
	generateRefreshToken,
	replaceDbRefreshToken,
};