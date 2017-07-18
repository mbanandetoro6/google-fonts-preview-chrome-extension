'use strict'
const gulp = require('gulp')
const gulpScss = require('gulp-sass')
const del = require('del')
const plumber = require('gulp-plumber')

gulp.task('scss', scss)
gulp.task('scss:watch', gulp.series(scss, scssWatch))
gulp.task('clear', clear)
gulp.task('build', gulp.series('clear', 'scss', build))
gulp.task('default', gulp.task('watch'))

function scss () {
  return gulp.src('./source/scss/*.scss')
    .pipe(plumber())
    .pipe(gulpScss().on('error', gulpScss.logError))
    .pipe(gulp.dest('./source/css/'))
}

function scssWatch () {
  return gulp.watch('./source/scss/**/*.scss', scss)
}

function clear () {
  return del('./dist/')
}

function build () {
  return gulp.src(['./source/html/*.html', './source/css/*.css', './source/js/*.js', './source/manifest.json'], {
    base: './source/'
  }).pipe(gulp.dest('./dist/'))
}
