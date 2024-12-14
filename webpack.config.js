const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/Main.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    compress: {
                        inline: false,
                    },
                    mangle: false,
                },
            }),
        ],
    },
    output: {
        filename: 'snowflake.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'Main',
    },
};