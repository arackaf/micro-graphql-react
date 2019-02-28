const remove = require("remove");
const gulp = require("gulp");
const gulpBabel = require("gulp-babel");
const rename = require("gulp-rename");
const gprint = require("gulp-print");

var babelOptionsWithImport = {
  presets: ["react"],
  plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-object-rest-spread"]
};

var babelES5Options = {
  presets: ["es2015", "react"],
  plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-object-rest-spread"]
};

try {
  remove.removeSync("./lib");
  remove.removeSync("./lib-es5");
} catch (e) {}

transpileSource();
//transpileSourceES5();
function transpileSource() {
  gulp
    .src("./src/**/*.js", { base: "./" })
    .pipe(gulpBabel(babelOptionsWithImport))
    .pipe(
      rename(path => {
        path.dirname = path.dirname.replace(/src/, "lib");
      })
    )
    .pipe(gulp.dest(""))
    .pipe(
      gprint(function(filePath) {
        return "File transpiled: " + filePath;
      })
    );
}

function transpileSourceES5() {
  gulp
    .src("./src/**/*.js", { base: "./" })
    .pipe(gulpBabel(babelES5Options))
    .pipe(
      rename(path => {
        path.dirname = path.dirname.replace(/src/, "lib-es5");
      })
    )
    .pipe(gulp.dest(""))
    .pipe(
      gprint(function(filePath) {
        return "File transpiled: " + filePath;
      })
    );
}
