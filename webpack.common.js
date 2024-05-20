const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');

module.exports = {
    entry: {
        main: './websrc/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'bundle'),
        filename: '[name].[contenthash].bundle.js',
        clean: true
    },
    module: {
        rules: [
        {
            test: /\.s[ac]ss$/i,
            use: [
            "style-loader",
            "css-loader",
            "sass-loader",
            ],
        },
        ],
    },
    plugins: [
        new WebpackManifestPlugin({
            fileName: 'manifest.json',
            publicPath: '/webpack/',
        }),
    ]
};

