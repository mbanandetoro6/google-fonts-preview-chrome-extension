'use strict'
const gulp = require('gulp')
const gulpScss = require('gulp-sass')
const del = require('del')
const plumber = require('gulp-plumber')
const gulpIf = require('gulp-if')
const cleanCss = require('gulp-clean-css')
const cp = require('child_process').spawn
var isProduction = process.env.NODE_ENV === 'production'
console.log(isProduction)

gulp.task('scss', scss)
gulp.task('scss:watch', gulp.series(scss, scssWatch))
gulp.task('webpack', () => run('webpack'))
gulp.task('webpack:watch', () => run('webpack:w'))
gulp.task('webpack:production', () => run('webpack:production'))
gulp.task('watch', gulp.parallel('scss', 'webpack', 'scss:watch', 'webpack:watch'))

gulp.task('clear', clear)
gulp.task('build', gulp.series('clear', 'scss', 'webpack:production', build))
gulp.task('default', gulp.task('watch'))

function scss () {
  return gulp.src('./source/scss/*.scss')
    .pipe(plumber())
    .pipe(gulpScss({outputStyle: 'expanded'}).on('error', gulpScss.logError))
    .pipe(gulpIf(isProduction, cleanCss()))
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

function run (npmTask) {
  return cp('npm run ' + npmTask, [], {
    shell: true,
    stdio: 'inherit'
  })
}
