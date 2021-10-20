const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    //mode: 'production',
    //mode: 'development',
    target: 'web',
    devtool: 'source-map',
    plugins: [new MiniCssExtractPlugin({
        filename: 'css/main_style.css',
    })],
    entry: {
        'js/main': {
            import: './js/main_vueapp.js',
        },
        'js/main_style': {
            import: './js/index.js',
        },
    },
    output: {
        // library: 'global_se',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'src/shapeeditor/static/shapeeditor/'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.s?css/i,
                use: [MiniCssExtractPlugin.loader,
                      'css-loader',
                      'postcss-loader',
                      'sass-loader'],
            },
        ],
    },
};
