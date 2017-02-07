'use strict';

var concurrent = {
  scripts: [
    'browserify',
    'eslint:scripts'
  ],
  tests: [
    'browserify:test',
    'eslint:tests'
  ],
  build: [
    'browserify',
    'postcss:dev',
    'copy:build',
    'copy:test',
    'copy:leaflet',
    'copy:locationview_images',
    'eslint:scripts',
    'eslint:tests'
  ],
  dist: [
    'copy:dist',
    'postcss:dist',
    'uglify'
  ]
};

module.exports = concurrent;
