const path = require('path');

module.exports = {
    //mode: 'production',
    //mode: 'development',
    target: 'web',
    entry: {
        main: {
            import: './src/main.js',
        },
    },
    output: {
        library: 'global_se',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
