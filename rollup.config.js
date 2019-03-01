const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const path = require("path");

const getConfig = ({ file, minify = true, presets = [], plugins = [] }) => ({
  input: "./src/index.js",
  output: {
    format: "esm",
    file
  },
  external: ["react", "react-dom"],
  plugins: [
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/preset-react", ...presets],
      plugins: ["@babel/plugin-proposal-class-properties", ...plugins]
    }),
    //minify && terser({}),
    resolve({}),
    commonjs({ include: ["node_modules/**"] })
  ]
});

let es5config = ["@babel/preset-env", { targets: { ie: "11" } }];

module.exports = [
  getConfig({ file: "index.js" }),
  //getConfig({ file: "index-debug.js", minify: false }),
  getConfig({ file: "index-es5.js", presets: [es5config], plugins: ["@babel/plugin-proposal-object-rest-spread"] }),
  //getConfig({ file: "index-es5-debug.js", minify: false, presets: [es5config], plugins: ["@babel/plugin-proposal-object-rest-spread"] })
];
