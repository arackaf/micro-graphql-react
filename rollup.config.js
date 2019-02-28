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
    minify ? terser({}) : null,
    resolve({}),
    commonjs({
      include: ["node_modules/**"],
      exclude: ["node_modules/process-es6/**"],
      namedExports: {
        "node_modules/react/index.js": ["Children", "Component", "PropTypes", "createElement"],
        "node_modules/react-dom/index.js": ["render"]
      }
    })
  ].filter(p => p)
});

module.exports = [getConfig({ file: "index.js" }), getConfig({ file: "index-debug.js", minify: false })];

const orig = {
  input: "./src/index.js",
  output: {
    format: "esm",
    file: "./umd/umd-rollup-bundle.js"
  },
  external: ["react", "react-dom"],
  plugins: [
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/preset-react"],
      plugins: ["@babel/plugin-proposal-class-properties"]
    }),
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
