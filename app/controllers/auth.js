const mongoose = require('mongoose');
const bCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/app');

const User = mongoose.model('User');

const signIn = (req, res) => {
	const { email, password } = req.body;
	User.findOne({email})
		.exec()
		.then((user) => {
			if(!user){
				res.status(401).json({ message: 'Пользователь не существует' });
			}

			const isValid = bCrypt.compareSync(password, user.password);

			if(isValid) {
				const token = jwt.sign(user._id.toString(), jwtSecret);
				res.json({token});
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

module.exports = {
	signIn,
	registration,
	activate,
}