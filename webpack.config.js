const path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/main.tsx',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/,
                use: 'awesome-typescript-loader',
                exclude: '/tests/'
            },
            {
                test: /\.(js)$/,
                use: [{
                    loader: 'source-map-loader',
                    options: {
                        enforce: 'pre',
                        presets: ['@babel/preset-env', '@abbel/preset-react']
                    }
                }],
                exclude: '/node_modules/'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(svg|eot|woff|ttf|svg|woff2)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: "[path][name].[ext]"
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve('./src')
        ],
        extensions: ['.ts', '.tsx', '.js', 'json']
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        watchContentBase: true,
        port: 3000,
        open: true
    }
};