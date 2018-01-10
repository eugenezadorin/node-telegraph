const app = require('./server/app');
const config = require('./server/config');
const port = config.appPort;

app.listen(port, () => {
    console.log('Running on http://localhost:' + port + '/');
});
