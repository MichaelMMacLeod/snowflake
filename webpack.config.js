const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        snowflake: './src/SnowflakeElement.ts',
        snowflake_graph: './src/SnowflakeGraphElement.ts',
    },
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
                        passes: 10,
                        inline: true,
                        // When reduce_funcs is true (the default), references to single use
                        // function names are replaced with immediately-called closures. From
                        // profiling, it shows that these closures need to be
                        // allocated/deallocated. If we turn this off, no more allocations occur.
                        reduce_funcs: false,
                    },
                    mangle: false,
                },
            }),
        ],
    },
    output: {
        library: '[name]',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
};