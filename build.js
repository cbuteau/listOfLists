
console.log('Entered build script at ' + new Date());
// Some script to package and release the extension.

// maybe grunt.
var gulp = require('gulp');

gulp.task('package', function() {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('listOfLinks-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));  
});
