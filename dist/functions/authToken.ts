import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWTConfig, tokenConfig } from '../config';

const jwtConfig = new JWTConfig;
const secret: string = jwtConfig.secret;
const accessToken: tokenConfig = jwtConfig.access;
const refreshToken: tokenConfig = jwtConfig.refresh;

const Token = mongoose.model('Token');

type TokenObject = {
  id: string,
  token: string
}
const generateAccessToken = (userId: string): TokenObject => {
  const payload: object = {
    id: userId,
    type: accessToken.type,
  };

  const options: object = { expiresIn: accessToken.expiresIn };
  return {
    id: userId,
    token: jwt.sign(payload, secret, options),
  };
};

const generateRefreshToken = (): TokenObject => {
  const tokenId: string = uuid();
  const payload: object = {
    id: tokenId,
    type: refreshToken.type,
  };

  const options = { expiresIn: refreshToken.expiresIn };
  return {
    id: tokenId,
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