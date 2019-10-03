import express from 'express'
import mongoose from "mongoose";
import'./models';
import bodyParser from "body-parser";
import {app as configApp} from "./config";
import { auth } from "./routes";
const app = express()
app.use(bodyParser.json());
app.use('/', auth);
const { appPort, mongoUri } = configApp;
mongoose
	.connect(mongoUri)
	.then(() => {
		app.listen(
			appPort,
			() => console.log(`Listening on port ${appPort}...`),
		);
	})
	.catch(err => console.error(`Error connecting to mongo: ${mongoUri} `, err));