//jslint node
'use strict';

var fs = require('fs');

var gulp = require('gulp');
var runSequence = require('run-sequence');
//var crx = require('gulp-crx-pack');
//var ChromeExtension = require('crx');
var plugins = require('gulp-load-plugins')();

var gulpdebug = require('gulp-debug');

gulp.task('default', function() {
//  console.log('Default gulp');

  runSequence(
      'package');
});

gulp.task('staging', function() {
    var debugOptions = {
      title: 'staging:',
      minimal: false
    };
    var stream = gulp.src(['manifest.json',
      '*.png',
      'popup.js',
      'popup.html',
      'popup.css'])
      .pipe(gulpdebug(debugOptions))
      .pipe(gulp.dest('./dist')).pipe(gulpdebug(debugOptions));

    return stream;
});

gulp.task('manifest', ['staging'] ,function() {
      var manifest = require('./dist/manifest.json');
});

gulp.task('extension', ['manifest'], function() {
  var manifest = require('./dist/manifest.json');
  var packageName = 'listOfLinks-' + manifest.version + '.zip';

  gulp.src('./dist/**').pipe(gulpdebug({
    title: 'extension:',
    minimal: false
  }));

  // var stream = gulp.src('./dist/**').pipe(
  //   crx({
  //     privateKey: fs.readFileSync('./certs/listOfLists.pem'),
  //     filename: packageName
  //   }))
  //   .pipe(gulp.dest('package'));

  //this zips it...
  var stream = gulp.src('./dist/**').pipe(plugins.zip('listOfLinks-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));

  return stream;
});

gulp.task('package', ['staging', 'manifest', 'extension'], function(cb) {
  console.log('Packaging...')
  //runSequence('staging', 'manifest' ,'extension', cb);

  // gulp.src(['manifest.json',
  //   '*.png',
  //   'popup.js',
  //   'popup.html',
  //   'popup.css'])
  //   .pipe(gulp.dest('./dist'));


  // gulp.src(['/**',
  // '!/node_modules/**',
  // '!gulp*',
  // '!/dist/**',
  // '!/package/**'])
  // .pipe(gulp.dest('./dist'));

  // var manifest = require('./manifest.json');
  // var packageName = 'listOfLinks-' + manifest.version + '.zip';

  // gulp.src('./dist/**').pipe(
  //   crx({
  //     privateKey: fs.readFileSync('./certs/listOfLists.pem'),
  //     filename: packageName
  //   }))
  //   .pipe(gulp.dest('package'));



  // this zips it...
  // gulp.src('./dist/**').pipe(plugins.zip('listOfLinks-' + manifest.version + '.zip'))
  //   .pipe(gulp.dest('package'));
});
