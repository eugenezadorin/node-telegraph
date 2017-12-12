const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// @todo: move to configuration
const appSecret = '79f210e028a13d9e21a938972ecedd264708da9a0b7a93b3c2669bada7ce96f1501eeda3ade501606595558ab0b95db2ba11e2a945358082251b8223925eb173';


app.use(bodyParser.json());

app.use(cookieParser(appSecret));

app.use('/static', express.static(path.join(__dirname, '../public')));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

module.exports = app;