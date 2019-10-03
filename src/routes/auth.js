import express from "express";
import mongoose from 'mongoose';
import bCrypt from'bcrypt';
import jwt from'jsonwebtoken';
import authHelper from '../functions/authToken';
import nodemailer from 'nodemailer';

const User = mongoose.model('User');
const Token = mongoose.model('Token');

const reg = /[a-zA-Z_0-9]+/ ;

const router = express.Router();

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
			if(user.status != "1"){
				res.status(401).json({ message: 'Ваш аккаунт не активирован, проверьте почту' });
			}
			else {
				const isValid = bCrypt.compareSync(password, user.password);
				if(isValid) {
					updateTokens(user._id).then(tokens => res.json(tokens));
				} else {
					res.status(401).json({ message: 'Введены неверные данные' });
				}
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
			if(login.match(reg)[0] !== login)
				res.status(401).json({ message: 'Вы ввели логин неверного формата' });
			else
				if(password.match(reg)[0] !== password)
					res.status(401).json({ message: 'Вы ввели пароль неверного формата' });
			else {
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
				transporter.sendMail({
				from: 'vladyslav.boichenko@482.solutions',
				to: email,
				subject: 'hello world!',
				html: `<h1>Вы зарегистрировались</h1><p>Для активации аккаунта ${login} перейдите по ссылке 127.0.0.1:3000/activate/${email}</p>`
				});
				res.json({ success: true });
			}
		}else {
			res.status(401).json({ message: 'Пользователь под данной почтой или именем пользователя уже зарегистрирован!' });
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
	if("password" in req.body)
		req.body.password = bCrypt.hashSync(req.body.password, 10);
	User.findOneAndUpdate({_id: req.params.id}, req.body)
	.exec()
	.then(user => {
		if(user != null)

			res.json({ success: true })
		else
			res.status(401).json({ message: 'Пользователь не найден!' });
	})
	.catch(err => res.status(500).json(err))
};

const remove = (req, res) => {
	User.deleteOne({_id: req.params.id})
	.exec()
	.then((user) =>res.json({ success: true }))
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

router.post('/signin', signIn);
router.post('/registration', registration);
router.get('/activate/:email', activate);
router.put('/user-update/:id', update);
router.post('/refresh-tokens', refreshTokens);
router.delete('/remove/:id',remove);

export default router;