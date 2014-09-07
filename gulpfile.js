var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var util = require('gulp-util');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('default', ['connect', 'watch']);

gulp.task('clean', function() {
	return gulp.src(['./dist', './src/css'], { read: false })
		.pipe(clean())
		.on('error', util.log);
});

gulp.task('watch', function() {
	gulp.watch('./src/scss/**/*.scss', ['styles']);
	gulp.watch('./src/js/**/*.js', ['scripts']);
	gulp.watch('./src/*.html', ['html']);
});

gulp.task('connect', function() {
	connect.server({
		root: 'src',
		port: 8080,
		livereload: true
	});
});

gulp.task('styles', function() {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(sass({
			errLogToConsole: true,
			sourceComments: 'normal',
			outputStyle: 'nested'
		}))
		.pipe(prefix('last 5 version', '> 1%', 'ie 8', 'ie 7'))
		.pipe(gulp.dest('./src/css'))
		.pipe(connect.reload())
		.on('error', util.log);
});

gulp.task('html', function() {
	return gulp.src('./src/*.html')
		.pipe(connect.reload())
		.on('error', util.log);
});

gulp.task('scripts', function() {
	return gulp.src('./src/js/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish, { verbose: true }))
		.pipe(connect.reload())
		.on('error', util.log);
});