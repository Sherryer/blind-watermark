const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const webpack = require('webpack')

const devMode = true

const buildFileName = 'dist'
const cdnPath = ''

module.exports = {
    entry: {
        boundle: './src/index.jsx',
    },
    output: {
        path: `${__dirname}/${buildFileName}/`,
        filename: 'js/[name].[hash:20].js',
        publicPath: devMode ? '' : cdnPath
    },
    mode: devMode ? 'development' : 'production',
    devtool: 'eval-source-map',
    devServer: {
        port: 8142,
        progress: true,
        open: true,
        contentBase: `./${buildFileName}`,
        disableHostCheck: true,

        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                pathRewrite: {'/api': ''}
            }
        },
    },
    optimization: {
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        splitChunks: {
            cacheGroups: {
                common: {
                    minSize: 0,
                    minChunks: 2,
                    chunks: 'initial'
                },
                vendor: {
                    priority: 10,
                    test: /node_modules/,
                    minSize: 0,
                    minChunks: 2,
                    chunks: 'initial'
                }
            }
        }
    },

    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: devMode,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        }
                    },
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ],
                            plugins: [
                                ['@babel/plugin-proposal-decorators', {'legacy': true}],
                                ['@babel/plugin-proposal-class-properties', {'loose': true}]
                            ]
                        }
                    },
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(jpg|jpeg|png|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1,
                        outputPath: 'img/',
                    }
                }]
            },
        ]
    },

    externals: {
        // react: 'React',
        // 'react-dom': 'ReactDOM'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            DEV: JSON.stringify('production')
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }),
        new HtmlWebpackPlugin({
            template: './template/index.html',
            filename: `index.html`,
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
            },
            chunks: ['boundle', 'common', 'vendor']
        }),

        new MiniCssExtractPlugin({
            filename: devMode ? 'css/[name].css' : 'css/[name].[hash].css',
            chunkFilename: devMode ? 'css/[id].css' : 'css/[id].[hash].css',
        }),
    ],
}
