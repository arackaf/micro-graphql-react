const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const path = require("path");

module.exports = {
  input: "./index.js",
  output: {
    format: "iife",
    file: "./umd/umd-rollup-bundle.js",
    name: "foooo"
  },
  external: ["react", "react-dom"],
  plugins: [
    terser({}),
    resolve({}),
    commonjs({
      include: ["node_modules/**"],
      exclude: ["node_modules/process-es6/**"],
      namedExports: {
        "node_modules/react/index.js": ["Children", "Component", "PropTypes", "createElement"],
        "node_modules/react-dom/index.js": ["render"]
      }
    })
  ]
};
