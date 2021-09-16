const gulp = require("gulp");
var sass = require("gulp-sass")(require("sass"));
const del = require("del");

gulp.task("scss", () => {
  return gulp
    .src("scss/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./public/css/"));
});

gulp.task("clean", () => {
  return del(["./public/css/main.css"]);
});

gulp.task('watch', () => {
    gulp.watch('scss/main.scss', (done) => {
        gulp.series(['clean', 'styles'])(done);
    });
});
gulp.task("default", gulp.series(["clean", "scss","watch"]));
