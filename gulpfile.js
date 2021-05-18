const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const sourceDirectory = './src/';
const testDirectory = './tests/';
const scripts = sourceDirectory + '*.js';
const tests = testDirectory + '*.js';

const compile = () => {
    return gulp.src(scripts)
        .pipe(gulp.dest('./dist'));
};

const test = () => {
    return gulp.src(tests)
        .pipe($.mocha({
            reporter: 'spec'})
    );
};

exports.compile = compile;
exports.test = gulp.series(compile, test);
exports.default = compile;