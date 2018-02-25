var gulp = require('gulp');
var bs = require('browser-sync').create();
var sass = require('gulp-sass');

gulp.task('browser-sync', function () {
  bs.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('sass', function () {
    return gulp.src('scss/*.scss')
                .pipe(sass())
                .pipe(gulp.dest('css'))
                .pipe(bs.reload({stream: true}));
});

gulp.task('watch', ['browser-sync'], function () {
    gulp.watch("scss/*.scss", ['sass']);
    gulp.watch("*.html").on('change', bs.reload);
    gulp.watch("css/*.css").on('change', bs.reload);
    gulp.watch("js/*.js").on('change',bs.reload);
});
