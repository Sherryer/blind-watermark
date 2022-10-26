const path = require('path');

module.exports = {
    entry: '/src/indexWeb.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        libraryTarget: 'umd',
    },
    // mode: 'production',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.wasm$/,
                use: [
                    {
                        loader: 'binary-code-loader',
                        options: {
                            limit: true,
                        },
                    },
                ],
            },
            {
                test: /\.(js|ts)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env',],
                            plugins: [
                                ["@babel/plugin-transform-runtime"],
                                ["@babel/plugin-proposal-private-methods", { "loose": true }],
                                ['@babel/plugin-proposal-decorators', {'legacy': true}],
                                ['@babel/plugin-proposal-class-properties', {'loose': true}]
                            ]
                        }
                    },
                ],
                exclude: /node_modules/
            },
            {
                test: /\.worker\.js$/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            inline: 'no-fallback',
                        }
                    },
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: [
                                ["@babel/plugin-transform-runtime"],
                                ["@babel/plugin-proposal-private-methods", { "loose": true }],
                                ['@babel/plugin-proposal-decorators', {'legacy': true}],
                                ['@babel/plugin-proposal-class-properties', {'loose': true}]
                            ]
                        },
                    }
                ]
            }
        ]
    }
};
