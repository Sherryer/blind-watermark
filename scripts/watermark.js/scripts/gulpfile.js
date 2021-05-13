const gulp = require('gulp');
const babel = require('gulp-babel');
const {default: uglify} = require('gulp-uglify-es');

gulp.task('default', () => gulp.src('../src/**/*.js')
    .pipe(babel({
        presets: ['@babel/preset-env'],
    }))
    .pipe(uglify())
    .pipe(gulp.dest('../lib')));
