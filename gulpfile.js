const gulp = require('gulp');
const eslint = require('gulp-eslint');
const cp = require('child_process');
const webpack = require('webpack-stream');
const mocha = require('gulp-mocha');
const protractor = require('gulp-protractor').protractor;
var children = [];

var serverFiles = ['lib/**/*.js', 'test/**/*test.js', 'gulpfile.js',
                  'index.js', 'server/**/*.js'];
var clientFiles = ['app/**/*.js'];

var serverTestFiles = ['test/*.js'];

// lint tasks
gulp.task('lint:server', () => {
  return gulp.src(serverFiles)
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('lint:client', () => {
  return gulp.src(clientFiles)
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('lint', ['lint:server', 'lint:client']);

// build tasks
gulp.task('webpack:dev', ['lint'], () => {
  return gulp.src('app/js/entry.js')
  .pipe(webpack( {
    output: {
      filename: 'bundle.js'
    }
  }))
  .pipe(gulp.dest('./build'));
});

gulp.task('static:dev', () => {
  return gulp.src('app/**/*.html')
  .pipe(gulp.dest('./build'));
});

gulp.task('css:dev', () => {
  return gulp.src('app/css/**/*.css')
  .pipe(gulp.dest('./build'));
});

gulp.task('build', ['webpack:dev', 'static:dev', 'css:dev']);

// test tasks
gulp.task('mocha', () => {
  return gulp.src(serverTestFiles)
  .pipe(mocha());
});

gulp.task('startServers', ['build'], () => {
  children.push(cp.fork('test/integration/integration_servers.js'));
});

gulp.task('protractor', ['startServers'], () => {
  return gulp.src('test/integration/**/*spec.js')
  .pipe(protractor({
    configFile: 'test/integration/config.js'
  }))
  .on('end', () => {
    children.forEach( (child) => {
      child.kill('SIGTERM');
    });
  })
  .on('error', () => {
    children.forEach( (child) => {
      child.kill('SIGTERM');
    });
  });
});
