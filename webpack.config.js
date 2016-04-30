const webpack = require('webpack'),
    path = require('path')

const SRC = path.resolve(__dirname, "src"),
    NODE_MODULES = path.resolve(__dirname, "node_modules")

const babelSettings = {
    presets: ["es2015", "react"],
    plugins: [
        "check-data-access"
    ],
}

if (process.env.NODE_ENV === 'production') {
    babelSettings.plugins.push("transform-react-inline-elements");
    babelSettings.plugins.push("transform-react-constant-elements");
}

const config = {
    entry: [
        './src/index.js'
    ],
    module: {
        loaders: [{
            test: /\.jsx?$/,
            include: SRC,
            loader: `babel-loader?${JSON.stringify(babelSettings)}`
        }, {
            test: [/\.png$/, /\.jpg$/, /\.docx$/],
            loader: "url-loader?limit=100000"
        }, {
            /* font-awesome */
            test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=100000"
        }, {
            test: /\.css$/,
            include: [NODE_MODULES, SRC],
            loader: 'style-loader!css-loader!postcss-loader',
        }, {
            test: /\.json$/,
            loader: "json-loader"
        }]
    },
    resolve: {
        root: SRC,
        extensions: ['', '.js', '.jsx'],
    },
    output: {
        path: path.resolve(__dirname, 'public', 'assets'),
        publicPath: '/assets',
        filename: 'bundle.js'
    },
    postcss: [
        require('autoprefixer')
    ],
    plugins: [
        new webpack.DefinePlugin({
            DEBUG_ENABLED: (process.env.NODE_ENV !== 'production')
        }),
    ]
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );

} else {
    config.devServer = {
        contentBase: './public',
        hot: true,
        inline: true,
        host: "0.0.0.0",
        port: 2708
    }
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin()
    );

}

module.exports = config
