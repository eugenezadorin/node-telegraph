require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

app.use(cookieParser(process.env.APP_SECRET));

app.use('/', express.static(path.join(__dirname, '../public')));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

module.exports = app;