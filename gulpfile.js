const gulp = require('gulp');
const merge = require('merge2');

// gulp plugins and utils
const gutil = require('gulp-util');
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const filter = require('gulp-filter');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-function');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const easyimport = require('postcss-easy-import');

const swallowError = function swallowError(error) {
    gutil.log(error.toString());
    gutil.beep();
    this.emit('end');
};

const nodemonServerInit = function () {
    livereload.listen(1234);
};

gulp.task('build', ['css', 'js'], function (/* cb */) {
    return nodemonServerInit();
});

gulp.task('build-once', ['css', 'js'], function () {
    
});

gulp.task('generate', ['css', 'js']);

gulp.task('css', function () {
    const processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano()
    ];

    return merge(
        gulp.src('./assets/css/main.css')
            .on('error', swallowError)
            .pipe(sourcemaps.init())
            .pipe(postcss(processors))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./assets/built'))
            .pipe(livereload()),
        gulp.src('./assets/css/rainbow-monokai.css')
            .on('error', swallowError)
            .pipe(sourcemaps.init())
            .pipe(postcss(processors))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./assets/built'))
            .pipe(livereload())
    )
});

gulp.task('js', function () {
    // const jsFilter = filter(['**/*.js'], {restore: true});

    return merge(
        gulp.src('./assets/js/main.js')
            .on('error', swallowError)
            .pipe(jsImport({ hideConsole: true }))
            .pipe(sourcemaps.init())
            // .pipe(jsFilter)
            .pipe(concat('main.js'))
            .pipe(uglify())
            // .pipe(jsFilter.restore)
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./assets/built'))
            .pipe(livereload()),
        // uglify
        gulp.src(['./assets/js/commentbox.js', './assets/js/infinitescroll.js'])
            .on('error', swallowError)
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./assets/built'))
            .pipe(livereload()),
        // no uglify
        gulp.src('./assets/js/rainbow.js')
            .on('error', swallowError)
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./assets/built'))
            .pipe(livereload())
    )
});

gulp.task('watch', function () {
    gulp.watch('assets/css/**', ['css']);
});

gulp.task('zip', ['css', 'js'], function () {
    const targetDir = 'dist/';
    const themeName = require('./package.json').name;
    const filename = themeName + '.zip';

    return gulp.src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
});

gulp.task('default', ['build'], function () {
    gulp.start('watch');
});
