/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /imooc-cli-dev/models/package/webpack.config.js
 */
const path = require('path');
module.exports = {
    entry: './lib/index.js',
    output: {
        path: path.join(__dirname, "/dist"),
        filename: 'index.js'
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
                                // useESModule: true,
                                // helper: true
                            }
                        ]
                    ]
                }
            }
        }]
    }
};