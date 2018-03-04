var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    "micro-graphql-react": "./index-local.js"
  },
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "umd")
  },
  resolve: {
    extensions: [".js"],
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  },
  externals: {
    react: "react"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["react"],
          plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-object-rest-spread"]
        }
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin({ uglifyOptions: { ie8: false, ecma: 8 } }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": "production"
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ].filter(p => p)
};
