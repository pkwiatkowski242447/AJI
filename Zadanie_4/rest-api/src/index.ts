import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors'
import mongoose from 'mongoose';
import router from './router';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

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

app.use('/', router());

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`HTTP server is running at http://localhost:${port}/`);
});