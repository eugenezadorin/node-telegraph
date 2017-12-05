const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
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
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin(),
        new ExtractTextPlugin({
            filename: './public/css/bundle.css',
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin()
    ]
};