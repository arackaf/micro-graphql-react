const remove = require("remove");
const gulp = require("gulp");
const gulpBabel = require("gulp-babel");
const rename = require("gulp-rename");
const gprint = require("gulp-print");

var babelOptionsWithImport = {
  presets: ["react"],
  plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-object-rest-spread"]
};

try {
  remove.removeSync("./lib");
} catch (e) {}

transpileSource();
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
