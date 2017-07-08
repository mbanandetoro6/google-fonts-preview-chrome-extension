'use strict'
const debug = true
const gulp = require('gulp')
const gulpScss = require('gulp-sass')
const gulpBabel = require('gulp-babel')
const del = require('del')
const plumber = require('gulp-plumber')
var gulpBrowserify = require('gulp-browserify')
var liveServer = require('live-server')

gulp.task('scss', scss)
gulp.task('scss:watch', scssWatch)
gulp.task('js', gulp.parallel(browserify, js))
gulp.task('js:watch', gulp.parallel(browserifyWatch, jsWatch))
gulp.task('serve', gulp.parallel('scss:watch', 'js:watch', serve))
gulp.task('clear', clear)
gulp.task('build', gulp.series('clear', 'scss', 'js', build))
gulp.task('default', gulp.task('serve'))

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

function browserify () {
  return gulp.src('./source/babel/main.js')
    .pipe(plumber())
    .pipe(gulpBrowserify({
      insertGlobals: false,
      debug: debug
    }))
    .pipe(gulpBabel({
      presets: ['env']
    }))
    .pipe(gulp.dest('./source/js/'))
}

function browserifyWatch () {
  return gulp.watch(['./source/babel/**/*.js', '!**/background.js'], browserify)
}

function js () {
  return gulp.src('./source/babel/background.js')
    .pipe(plumber())
    .pipe(gulpBabel({
      presets: ['env']
    }))
    .pipe(gulp.dest('./source/js/'))
}

function jsWatch () {
  return gulp.watch('./source/babel/background.js', js)
}

function serve () {
  var params = {
    port: 8585, // Set the server port. Defaults to 8080.
    root: 'source', // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    ignore: ['source/scss/**/*.*', 'source/babel/**/*.*', 'source/manifest.json'], // comma-separated string for paths to ignore
    file: 'live-testing.html', // When set, serve this file for every 404 (useful for single-page applications)
    wait: 0, // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 2 // 0 = errors only, 1 = some, 2 = lots
  }
  liveServer.start(params)
}
