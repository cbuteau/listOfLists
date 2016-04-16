//jslint node
'use strict';

var fs = require('fs');

var gulp = require('gulp');
var runSequence = require('run-sequence');
var crx = require('gulp-crx-pack');
var plugins = require('gulp-load-plugins')();

gulp.task('default', function() {
//  console.log('Default gulp');

  runSequence(
      'package');
});

gulp.task('package', function() {
  // TODO filter out other files somehow.


  gulp.src(['manifest.json',
    '*.png',
    'popup.js',
    'popup.html',
    'popup.css'])
    .pipe(gulp.dest('./dist'));


  // gulp.src(['/**',
  // '!/node_modules/**',
  // '!gulp*',
  // '!/dist/**',
  // '!/package/**'])
  // .pipe(gulp.dest('./dist'));

  var manifest = require('./dist/manifest.json');
  var packageName = 'listOfLinks-' + manifest.version + '.zip';

  // gulp.src('./dist/**').pipe(
  //   crx({
  //     privateKey: fs.readFileSync('./certs/listOfLists.pem'),
  //     filename: packageName
  //   }))
  //   .pipe(gulp.dest('package'));



  // this zips it...
  gulp.src('./dist/**').pipe(plugins.zip('listOfLinks-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});
