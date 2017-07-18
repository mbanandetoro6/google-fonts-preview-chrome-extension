'use strict'
const debug = true
const gulp = require('gulp')
const gulpScss = require('gulp-sass')
const gulpBabel = require('gulp-babel')
const del = require('del')
const plumber = require('gulp-plumber')
var gulpBrowserify = require('gulp-browserify')

gulp.task('scss', scss)
gulp.task('scss:watch', gulp.series(scss, scssWatch))
gulp.task('js', js)
gulp.task('js:watch', gulp.series(js, jsWatch))
gulp.task('watch', gulp.parallel('scss:watch', 'js:watch'))
gulp.task('clear', clear)
gulp.task('build', gulp.series('clear', 'scss', 'js', build))
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

function js () {
  return gulp.src('./source/babel/*.js')
    .pipe(plumber())
    .pipe(gulpBrowserify({
      insertGlobals: false,
      debug: debug
    }))
    // .pipe(gulpBabel({
    //   presets: ['env']
    // }))
    .pipe(gulp.dest('./source/js/'))
}

function jsWatch () {
  return gulp.watch('./source/babel/**/*.js', js)
}
