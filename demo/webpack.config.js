var path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProd = process.env.NODE_ENV == "production";

module.exports = {
  entry: {
    demo: "./demo/index.js"
  },
  output: {
    filename: "[name]-[contenthash]-bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: isProd ? "production" : "development",
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
      },
      {
        test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf)$/,
        use: [
          {
            loader: "file-loader"
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
