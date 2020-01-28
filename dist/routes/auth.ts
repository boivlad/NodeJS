import express from 'express';
import mongoose from 'mongoose';
import bCrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { config } from '../config';
import { authToken } from '../functions';

const { secret } = config.jwt;

const User = mongoose.model('User');
const Token = mongoose.model('Token');

const router = express.Router();

const updateTokens = async (userId: string) => {
  const accessToken: string = authToken.generateAccessToken(userId);
  const refreshToken: any = authToken.generateRefreshToken();

  await authToken.replaceDbRefreshToken(refreshToken.id, userId);
  return {
    accessToken,
    refreshToken: refreshToken.token,
  };
};

const auth = async (req: any, res: any) => {
  const { login, password } = req.body;

  if (!login.match(/^[a-z_1-9]*$/gm)) {
    res.status(401).send('You entered an incorrect password');
    return;
  }

  try {
    const user: any = await User.findOne({ $or: [{ email: login }, { login: login }] });
    if (!user) {
      res.status(401).send('User does not exist');
      return;
    }

    if (!user.status) {
      res.status(401).send('Your account is not activated, check your mail');
      return;
    }
    const isValid = bCrypt.compareSync(password, user.password);
    if (isValid) {
      const tokens = await updateTokens(user._id);
      res.status(200).json(tokens);
      return;
    }
    res.status(401).send('Incorrect data');
  } catch (err) {
    res.status(500).json(err);
  }
};

const registration = async (req: any, res: any) => {
  try {
    const { login, email, password, phone } = req.body;
    const user = await User.findOne({ $or: [{ login }, { email }] });
    console.log();
    if (!login.match(/^[a-z_1-9]*$/gm)) {
      res.status(401).send('You entered an incorrect format login');
      return;
    }

    if (!password.match(/^[a-z_1-9]*$/gm)) {
      res.status(401).send('You entered an incorrect password');
      return;
    }

    if (user) {
      res.status(401).send('A user with this mail or username is already registered!');
      return;
    }
    const newUser = await User.create({
      login: login,
      email: email,
      password: bCrypt.hashSync(password, 10),
      phone: phone,
    });

    if (!newUser) {
      res.status(401).send('An error occurred while registering.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'patrick.wintheiser29@ethereal.email',
        pass: 'N2YGZZz4MQYNPYxcsF'
      }
    });

    await transporter.sendMail({
      from: 'patrick.wintheiser29@ethereal.email',
      to: email,
      subject: 'hello world!',
      html: `<h1>Вы зарегистрировались</h1><p>Для активации аккаунта ${ login } перейдите по ссылке 127.0.0.1:3000/api/v1/user/${ email }</p>`,
    });
    res.status(201).send('Registration successful!');
  } catch (err) {
    res.status(500).json(err);
  }
};

const update = async (req: any, res: any) => {
  if (!req.headers['content-length']) {
    const user = await User.findOneAndUpdate({ $and: [{ email: req.params.id }, { status: false }] },
      { status: true });
    if (user) {
      res.status(202).send('Your account has been activated.');
      return;
    }
    res.status(400).send('Your account is already activated or does not exist.');
    return;
  }
  if (req.body.password) {
    req.body.password = bCrypt.hashSync(req.body.password, 10);
  }
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
    if (user) {
      res.status(202).send('Your account is updated successfully');
      return;
    }
    res.status(404).send('User does not exist.');
    return;
  } catch (err) {
    res.status(404).send('User does not exist.');
  }
};

const remove = async (req: any, res: any) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    if (!!result.deletedCount) {
      res.status(200).send('Account has been successfully deleted.');
      return;
    }
    res.status(404).send('This account does not exist.');
  } catch (err) {
    res.status(500).json(err);
  }
};

const refreshTokens = async (req: any, res: any) => {
  const { refreshToken } = req.body;
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, secret);
    if (payload.type !== 'refresh') {
      res.status(400).send('Invalid Token');
      return;
    }
    const token: any = await Token.findOne({ tokenId: payload.id });

    if (!token) {
      res.status(400).send('Invalid Token');
      return;
    }
    const tokens = await updateTokens(token.userId);
    res.status(200).send(tokens);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(400).send('Token is deprecated');
      return;
    }
    res.status(400).send('Invalid Token');
  }
};
router.get('/user/:id', update);
router.post('/auth', auth);
router.post('/user', registration);
router.put('/user/:id', update);
router.put('/tokens', refreshTokens);
router.delete('/user/:id', remove);

export default router;