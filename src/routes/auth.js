import express from 'express';
import mongoose from 'mongoose';
import bCrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { app } from '../config';
const { secret } = app.jwt;
import authHelper from '../functions';

const User = mongoose.model('User');
const Token = mongoose.model('Token');

const regLoginPassword = /^.*[^A-z_1-9].*$/gm;

const router = express.Router();

const updateTokens = async (userId) => {
	const accessToken = authHelper.generateAccessToken(userId);
	const refreshToken = authHelper.generateRefreshToken();

	 await authHelper.replaceDbRefreshToken(refreshToken.id, userId);
	 return {
			accessToken,
			refreshToken: refreshToken.token,
		};
};

const auth = async (req, res) => {
	try {
		const { login, password } = req.body;

		if (regLoginPassword.test(password)) {
			res.status(401).json({ message: 'You entered an incorrect password' });
			return;
		}

		const user = await User.findOne({ $or: [{ email: login }, { login: login }] })

		if (!user) {
			res.status(401).json({ message: 'User does not exist' });
			return;
		}

		if (!user.status) {
			res.status(401).json({ message: 'Your account is not activated, check your mail' });
			return;
		}

		const isValid = bCrypt.compareSync(password, user.password);
		if (isValid) {
			const tokens = await updateTokens(user._id);
			res.json(tokens);
			return;
		}

		res.status(401).json({ message: 'Incorrect data' });
	} catch (err) {
		res.status(500).json(err);
	}
};

const registration = async (req, res) => {
	try{
		const { login, email, password, phone } = req.body;
		const user = await User.findOne({ $or: [{ login }, { email }] })
		if (regLoginPassword.test(login)) {
			res.status(401).json({ message: 'You entered an incorrect format login' });
			return;
		}

		if (regLoginPassword.test(password)) {
			res.status(401).json({ message: 'You entered an incorrect password' });
			return;
		}

		if (!user) {
			const newUser = await User.create({
				login: login,
				email: email,
				password: bCrypt.hashSync(password, 10),
				phone: phone,
			});

			if(!newUser){
				res.status(401).json({ message: 'An error occurred while registering.' });
				return;
			}

			const transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'vladyslav.boichenko@482.solutions',
					pass: '392781Vs',
				},
			});
			transporter.sendMail({
				from: 'vladyslav.boichenko@482.solutions',
				to: email,
				subject: 'hello world!',
				html: `<h1>Вы зарегистрировались</h1><p>Для активации аккаунта ${login} перейдите по ссылке 127.0.0.1:3000/activate/${email}</p>`,
			});
			res.status(401).json({ message: 'Registration successful!' });
			return;
		}
		res.status(401).json({ message: 'A user with this mail or username is already registered!' });
	} catch (err) {
		res.status(500).json(err);
	}
};

const update = async (req, res) => {
	try{
		if(!Object.keys(req.body).length){
			const user = await User.findOneAndUpdate({ $and: [{ email: req.params.id }, { status: false }] }, { status: true });
			if (user) {
				res.json({ message: 'Your account has been activated.' });
				return;
			}
				res.json({ message: 'Your account is already activated.' });
				return;
		}
		if (req.body.password){
			req.body.password = bCrypt.hashSync(req.body.password, 10);
		}
		const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
		if (user != null) {
			res.json({ success: true });
			return;
		}
		res.status(401).json({ message: 'User does not exist' });
	} catch(err) {
		res.status(500).json(err);
	}
};

const remove = async (req, res) => {
	try {
		const result = await User.deleteOne({ _id: req.params.id })
		if(!!result.deletedCount) {
			res.json({ message: 'Account has been successfully deleted.' });
			return;
		}
		res.json({ message: 'This account does not exist.' });
	} catch (err){
		res.status(500).json(err);
	}
};

const refreshTokens = async (req, res) => {
	const { refreshToken } = req.body;
	let payload;
	try {
		payload = jwt.verify(refreshToken, secret);
		if (payload.type !== 'refresh') {
			res.status(400).json({ message: 'Invalid Token' });
			return;
		}
		const token = await Token.findOne({ tokenId: payload.id })

		if (token === null) {
			throw new Error('Invalid Token');
		}
		const tokens = await updateTokens(token.userId);
			res.json(tokens);
	} catch (e) {
		if (e instanceof jwt.TokenExpiredError) {
			res.status(400).json({ message: 'Token is deprecated' });
			return;
		}
		res.status(400).json({ message: 'Invalid Token' });
	}
};

router.post('/auth', auth);
router.post('/user', registration);
router.put('/user/:id', update);
router.put('/tokens', refreshTokens);
router.delete('/user/:id', remove);

export default router;