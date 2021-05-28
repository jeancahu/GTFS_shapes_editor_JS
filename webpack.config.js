const path = require('path');

module.exports = {
    //mode: 'production',
    //mode: 'development',
    target: 'web',
    entry: {
        main: {
            import: './js/main.js',
        },
    },
    output: {
        library: 'global_se',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'src/shapeeditor/static/shapeeditor/js'),
    },
    devtool: 'eval',
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
        ],
    },
};
