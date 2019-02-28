const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const path = require("path");

const getConfig = ({ file, minify = true }) => ({
  input: "./src/index.js",
  output: {
    format: "esm",
    file
  },
  external: ["react", "react-dom"],
  plugins: [
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/preset-react"],
      plugins: ["@babel/plugin-proposal-class-properties"]
    }),
    minify && terser({}),
    resolve({}),
    commonjs({ include: ["node_modules/**"] })
  ]
});

module.exports = [getConfig({ file: "index.js" }), getConfig({ file: "index-debug.js", minify: false })];
