import express from 'express'
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { config } from './config';
import './models';
import { auth } from './routes';

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/', auth);

const { appPort, mongoUri } = config;
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