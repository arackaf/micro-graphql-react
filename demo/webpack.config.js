var path = require("path");

module.exports = {
  entry: {
    demo: "./demo/index.js"
  },
  output: {
    filename: "[name]-bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "react-redux/dist/"
  },
  mode: "development",
  resolve: {
    extensions: [".js"],
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]
  }
};
