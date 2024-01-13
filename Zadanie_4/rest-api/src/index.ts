import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import https from 'https';
import cors from 'cors'
import mongoose from 'mongoose';
import router from './router';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import { readFileSync } from 'node:fs';

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

// Connection with MongoDB database with Mongoose ODM.

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL, {
    auth: {
        username: process.env.MONGO_LOGIN,
        password: process.env.MONGO_PASSWORD,
    },
    authSource: 'admin',
});
mongoose.connection.on('error', (error : Error) => console.log(error));

const app : Application = express();
const port : number = parseInt(process.env.PORT) || 8080;

// Added logging for every API call.

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    credentials: true
}));

// Use for defined paths for REST resources

app.use('/v1', router());

// Use for all non-existent paths

app.use((request : express.Request, response : express.Response) => {
    return response
            .status(StatusCodes.NOT_FOUND)
            .json({
                message: 'Requested URL could not be found.'
            });
});

const httpsServer = https.createServer({
    key: readFileSync(path.resolve(__dirname, '../certs/cert-key.pem')),
    cert: readFileSync(path.resolve(__dirname, '../certs/cert.pem')),
    passphrase: process.env.PASSPHRASE,
}, app);

httpsServer.listen(port, () => {
    console.log(`HTTP server is running at http://localhost:${port}/`);
});