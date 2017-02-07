'use strict';

var concurrent = {
  scripts: [
    'browserify',
    'jshint:scripts'
  ],
  tests: [
    'browserify:test',
    'jshint:tests'
  ],
  build: [
    'browserify',
    'postcss:dev',
    'copy:build',
    'copy:test',
    'copy:leaflet',
    'copy:locationview_images',
    'jshint:scripts',
    'jshint:tests'
  ],
  dist: [
    'copy:dist',
    'postcss:dist',
    'uglify'
  ]
};

module.exports = concurrent;
