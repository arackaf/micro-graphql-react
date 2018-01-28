var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

var path = require("path");
var webpack = require("webpack");
var isProduction = process.env.NODE_ENV === "production" || process.argv.some(arg => arg.indexOf("webpack-dev-server") >= 0);

module.exports = {
  entry: {
    demo: "./demo/index.js",
    mainLibrary: "./index.js"
  },
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "react-redux/dist/"
  },
  resolve: {
    extensions: [".js"],
    modules: [path.resolve("./"), path.resolve("./node_modules")]
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
    isProduction ? new UglifyJsPlugin({ uglifyOptions: { ie8: false, ecma: 8 } }) : null,
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    }),
    isProduction ? new webpack.optimize.ModuleConcatenationPlugin() : null
  ].filter(p => p)
};
