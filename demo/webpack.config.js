var path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    demo: "./demo/index.js"
  },
  output: {
    filename: "[name]-[contenthash]-bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/"
  },
  mode: "development",
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-react", "@babel/preset-typescript"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      },
      {
        test: /\.s?css$/,
        oneOf: [
          {
            test: /\.module\.s?css$/,
            use: [
              MiniCssExtractPlugin.loader,
              { loader: "css-loader", options: { modules: true } },
              "sass-loader"
            ]
          },
          {
            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "demo/index.htm" }),
    new MiniCssExtractPlugin({ filename: "[name]-[contenthash].css" })
  ]
};
