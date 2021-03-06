// Gulp
var gulp = require('gulp');

// Plugins
var twig = require('gulp-twig');

var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var browserSync = require("browser-sync");
var filter = require('gulp-filter');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');

// Paths
var paths = {
  scripts: ['bower_components/jquery/dist/jquery.js',
    'bower_components/fastclick/lib/fastclick.js',
    'bower_components/modernizr/modernizr.js',
    'bower_components/foundation/js/foundation/foundation.js',
    'bower_components/foundation/js/foundation/foundation.equalizer.js',
    'bower_components/foundation/js/foundation/foundation.orbit.js',
    'bower_components/foundation/js/foundation/foundation.topbar.js',
    'bower_components/foundation/js/foundation/foundation.clearing.js',
    'assets/js/*.js'
  ],
  images: ['assets/img/**'],
  fonts: ['assets/fonts/**']
};

// Wipe off build folder
gulp.task('clean', function() {
  return gulp.src(['Build', 'build'], {
      read: false
    })
    .pipe(rimraf());
});

// Jade to HTML
gulp.task('twig', function() {
  gulp.src(['**/*.twig', '!./{node_modules/**, node_modules}'])
    .pipe(plumber())
    .pipe(twig({
      pretty: true
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Compile Sass
gulp.task('sass', function() {
  gulp.src(['assets/scss/main.scss', '!**/.DS_Store'])
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['bower_components/foundation/scss',
        'assets/scss'
      ],
      //outputStyle: 'compressed',
      errLogToConsole: true,
      sourceComments: 'normal'
    }))
    .pipe(prefix(
      "last 1 version", "> 1%", "ie 8", "ie 7"
    ))
    //.pipe(minifycss())
    .pipe(gulp.dest('build/assets/css'));
    //.pipe(filter('build/assets/css/*.css')) // Filtering stream to only css files
/*    .pipe(browserSync.reload({
      stream: true
    }));*/
});

// Uglify JS
gulp.task('uglify', function() {
  gulp.src(paths.scripts)
    .pipe(plumber())
    //.pipe(browserify())
    //.pipe(uglify({
    //  outSourceMap: false
    //}))
    .pipe(concat("main.js"))
    .pipe(gulp.dest('build/assets/js'))

});

// Compress images
gulp.task('imagemin', function() {
  gulp.src(paths.images, ['!**/.DS_Store'])
    .pipe(plumber())
    //.pipe(imagemin())
    .pipe(gulp.dest('build/assets/img'));
});

// Copy all static assets
gulp.task('copyFonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('build/assets/fonts'));
});


// Livereload
gulp.task('listen', function() {
  browserSync({
    server: {
      baseDir: "./build/"
    },
  });
});

gulp.task('wait', function(end) {
  //wait(5000);
  end();
});

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('refresh-sass', function() {
  setTimeout(function reload() {
    runSequence('wait', 'sass', 'reload');
      }, 5000);
});

// Watch files
gulp.task('watch', function(event) {
  gulp.watch(['twigs/**','**/*.twig'],
    [browserSync.reload]);
  gulp.watch('assets/scss/*.scss', ['refresh-sass']);
  //gulp.watch(paths.images, ['imagemin', browserSync.reload]);
  //gulp.watch(paths.fonts, ['copyFonts', browserSync.reload]);
  gulp.watch(paths.scripts, ['uglify', browserSync.reload]);
});

gulp.task('default', function(callback) {
  runSequence('wait', 'clean', ['sass',
      //'twig',
      'imagemin',
      'copyFonts',
      'uglify'
    ],
    'listen',
    'watch');
});
