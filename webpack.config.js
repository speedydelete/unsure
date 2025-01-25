
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'main/index.ts'),
    output: {
        filename: 'unsure.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'unsure',
            type: 'umd',
        },
    },
    resolve: {
        extensions: ['.html', '.js', '.jsx', '.ts', '.tsx'],
        modules: [path.resolve(__dirname, 'node_modules')],
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
            },
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-typescript'],
                },
            },
        ],
    },
}
