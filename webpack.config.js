const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './client/app.js',
    output: {
        filename: './public/js/bundle.js'
    },
    plugins: [
        new UglifyJsPlugin()
    ]
};