require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const config = require('./config');

app.use(bodyParser.json());

app.use(cookieParser(process.env.APP_SECRET));

app.use(fileUpload({
    limits: {
        fileSize: config.fileMaxSize,
        files: config.fileMaxUploads
    }
}));

app.use('/', express.static(path.join(__dirname, '../public')));

app.use('/file/', express.static(path.join(__dirname, 'upload')));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

module.exports = app;