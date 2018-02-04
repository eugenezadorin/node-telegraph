const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const env = process.env.NODE_ENV;

const config = {
    devtool: 'source-map',
    entry: './client/app.js',
    output: {
        filename: './public/js/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                }),
            },
            {
                test: /\.(sass|scss)$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader!sass-loader'
                }),
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: './public/css/bundle.css',
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin()
    ]
};

if (env == 'production') {
    config.plugins.push(new UglifyJsPlugin({
        sourceMap: true
    }));
}

module.exports = config;