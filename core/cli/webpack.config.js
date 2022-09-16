/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /imooc-cli-dev/core/cli/webpack.config.js
 */
const path = require('path');
module.exports = {
    entry: './bin/core.js',
    output: {
        path: path.join(__dirname, "/dist"),
        filename: 'core.js'
    },
    mode: 'development',
    target: 'node',
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|dist)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        [
                            '@babel/plugin-transform-runtime',
                            {
                                corejs: 3,
                                regenerator: true,
                                useESModule: true,
                                helper: true
                            }
                        ]
                    ]
                }
            }
        }]
    }
};