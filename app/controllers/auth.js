const mongoose = require('mongoose');
const bCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authHelper = require('../helpers/authHelper');
const nodemailer = require('nodemailer');
const { secret } = require('../../config/app').jwt;

const User = mongoose.model('User');
const Token = mongoose.model('Token');

const updateTokens = (userId) => {
	const accessToken = authHelper.generateAccessToken(userId);
	const refreshToken = authHelper.generateRefreshToken();

	return authHelper.replaceDbRefreshToken( refreshToken.id, userId)
		.then(() => ({
			accessToken,
			refreshToken: refreshToken.token,
		}));
};

const signIn = (req, res) => {
	const { login, password } = req.body;
	User.findOne({$or:[{email: login}, {login: login}]})
		.exec()
		.then((user) => {
			if(!user){
				res.status(401).json({ message: 'Пользователь не существует' });
			}
			const isValid = bCrypt.compareSync(password, user.password);
			if(isValid) {
				updateTokens(user._id).then(tokens => res.json(tokens));
			} else {
				res.status(401).json({ message: 'Введены неверные данные' });
			}

		})
		.catch(err => res.status(500).json({ message: err.message }));
};
const registration = (req, res) => {
	const { login, email, password, phone } = req.body;
	User.findOne({$or : [ {login}, {email} ]})
	.exec()
	.then((user) => {
		if(!user){
			User.create({
				login: login,
				email: email,
				password: bCrypt.hashSync(password, 10),
				phone: phone,
			});
			var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'vladyslav.boichenko@482.solutions',
				pass: '392781Vs'
			}
			});

			console.log('created');
			transporter.sendMail({
			from: 'vladyslav.boichenko@482.solutions',
			to: email,
			subject: 'hello world!',
			html: `<h1>Вы зарегистрировались</h1><p>Для активации аккаунта ${login} перейдите по ссылке 127.0.0.1:3000/activate/${email}</p>`
			});
			res.json({ success: true });
		}else {
			res.status(401).json({ message: 'Пользователь под данной почтой уже зарегистрирован!' });
		}
	})
	.catch(err => res.status(500).json(err));
};
const activate = (req, res) => {
	User.findOneAndUpdate({$and : [{email: req.params.email}, {status: "0"}]}, {status: 1})
	.exec()
	.then((user) => {
		if(user) {
			res.json({ message: "Ваш аккаунт активирован" });
		}
		else {
			res.json({ message: "Ваш аккаунт уже активирован" });
		}
	})
	.catch(err => res.status(500).json(err))
};
const update = (req, res) => {
	User.findOneAndUpdate({$and : [{email: req.params.email}, {status: "0"}]}, {status: 1})
	.exec()
	.then((user) => {
		if(user) {
			res.json({ message: "Ваш аккаунт активирован" });
		}
		else {
			res.json({ message: "Ваш аккаунт уже активирован" });
		}
	})
	.catch(err => res.status(500).json(err))
};
const refreshTokens = (req, res) => {
	const { refreshToken } = req.body;
	let payload;
	try{
		payload = jwt.verify(refreshToken, secret);
		if(payload.type !== 'refresh')
		{
			res.status(400).json({message: 'Неверный токен'});
			return;
		}
	}
	catch(e){
		if(e instanceof jwt.TokenExpiredError){
			res.status(400).json({message: 'Токен устарел'});
			return;
		}
		else if( e instanceof jwt.JsonWebTokenError){
			res.status(400).json({message: 'Неверный токен'});
			return;
		}
	}
	Token.findOne({tokenId: payload.id})
	.exec()
	.then((token) => {
		if(token === null) {
			throw new Error('Неверный токен');
		}
		return updateTokens(token.userId);
	})
	.then(tokens => res.json(tokens))
	.catch(err => res.status(400).json({message: err.message}));
};
module.exports = {
	signIn,
	registration,
	activate,
	refreshTokens,
}