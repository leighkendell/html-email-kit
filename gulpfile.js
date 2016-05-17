//Define all plugins
var gulp               = require('gulp');
var sass               = require('gulp-sass');
var fileinclude        = require('gulp-file-include');
var premailer          = require('gulp-premailer');
var prettify           = require('gulp-prettify');
var notify             = require("gulp-notify");
var plumber            = require('gulp-plumber');
var browserSync        = require('browser-sync');
var reload             = browserSync.reload;

//Define file paths
var sass_src           = 'source/sass/*.scss';
var email_src          = 'source/emails/*.html';
var sass_dest          = 'source';
var compiled_dest      = 'compiled';

//Include files
gulp.task('fileinclude', function() {
    gulp.src([email_src])
        //Compile HTML from includes
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))

        //Prettify compiled HTML
        .pipe(prettify({indent_size: 4}))

        //Output the compiled HTML
        .pipe(gulp.dest(compiled_dest));
});

//Sass
gulp.task('sass', ['fileinclude'], function () {
    return gulp.src(sass_src)
        //Notify on error
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))

        //Process sass
        .pipe(sass({
            outputStyle: 'compressed'
        }))

        //Output the compiled sass to this directory
        .pipe(gulp.dest(sass_dest));
});

//Inline CSS
gulp.task('inline', ['sass'], function() {
    return gulp.src([compiled_dest + '/*.html'])
        //Run premailer to inline CSS
        .pipe(premailer())

        //Output the compiled HTML
        .pipe(gulp.dest(compiled_dest))

        //Notify on successful compile
        .pipe(notify("Compiled: <%= file.relative %>"));
});

//Process HTML
gulp.task('process', function() {
    gulp.start('fileinclude', 'sass', 'inline');
});

//Browsersync Reload
gulp.task('bs-reload', ['inline'], function () {
    browserSync.reload();
});

//Browsersync
gulp.task('browsersync', function() {
    browserSync({
        server: {
            baseDir: "compiled"
        },

        //reloadDelay: 2000,
        notify: false
    });
});

//Default
gulp.task('default', ['browsersync'], function() {
    gulp.start('process');

    //Watch for changes
    gulp.watch([sass_src, email_src], ['bs-reload']);
});
