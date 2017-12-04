const express = require('express');
const app = express();
const port = 3000;

app.use('/static', express.static('public'));

app.set('view engine', 'pug');

app.set('views', './server/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(port, () => {
    console.log('Running on http://localhost:' + port + '/');
});
