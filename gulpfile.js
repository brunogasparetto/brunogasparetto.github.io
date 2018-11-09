var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

sass.compiler = require('node-sass');

gulp.task('css', function () {
    var plugins = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];

    return gulp
        .src(['./src/syntax.css', './src/main.scss'])
        .pipe(concat('main.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('js', function () {
    var plugins = [
        './node_modules/bootstrap/js/dist/index.js',
        './node_modules/bootstrap/js/dist/util.js',
        './node_modules/bootstrap/js/dist/collapse.js'
    ];

    return gulp
        .src(plugins)
        .pipe(concat('bootstrap.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./assets/js'));
});

gulp.task('default', gulp.parallel('css', 'js'));

gulp.task('watch', function () {
    gulp.watch('./src/**/*.+(scss|css)', gulp.series('css'));
});
