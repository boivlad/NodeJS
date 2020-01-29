import express from 'express'
import mongoose from "mongoose";
import bodyParser from "body-parser";
import './models';
import { auth } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/', auth);
const appPort: string = process.env.PORT!;
const mongoUri: string = process.env.mongoUri!;
mongoose
  .connect(mongoUri, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(
      appPort,
      () => console.log(`Listening on port ${ appPort }...`),
    );
  })
  .catch(err => console.error(`Error connecting to mongo: ${ mongoUri } `, err));