const { src, dest, parallel, series, watch } = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

sass.compiler = require('node-sass');

function css() {
    var plugins = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];

    return src(['./src/syntax.css', './src/main.scss'])
        .pipe(concat('main.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(dest('./assets/css'));
}

function js() {
    var plugins = [
        './node_modules/bootstrap/js/dist/index.js',
        './node_modules/bootstrap/js/dist/util.js',
        './node_modules/bootstrap/js/dist/collapse.js'
    ];

    return src(plugins)
        .pipe(concat('bootstrap.js'))
        .pipe(uglify())
        .pipe(dest('./assets/js'));
};

exports.default = parallel(css, js);
exports.watch = watch('./src/**/*.+(scss|css)', series(css));
