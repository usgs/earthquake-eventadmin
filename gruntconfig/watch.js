'use strict';

var config = require('./config');

var watch = {
  static: {
    files: [
      config.src + '/htdocs/**/*.php',
      config.src + '/htdocs/img/**/*.{png,jpg,jpeg,gif}',
      config.src + '/' + config.lib + '/inc/**/*.php'
    ],
    tasks: [
      'copy:build'
    ]
  },
  scripts: {
    files: [config.src + '/htdocs/**/*.js'],
    tasks: ['concurrent:scripts', 'mocha_phantomjs'],
    options: {
      livereload: config.liveReloadPort
    }
  },
  scss: {
    files: [config.src + '/htdocs/**/*.scss'],
    tasks: ['postcss:dev']
  },
  tests: {
    files: [
      config.test + '/*.html',
      config.test + '/**/*.js'
    ],
    tasks: ['concurrent:tests', 'mocha_phantomjs']
  },
  livereload: {
    options: {
      livereload: config.liveReloadPort
    },
    files: [
      config.build + '/' + config.src + '/htdocs/**/*.php',
      config.build + '/' + config.src + '/htdocs/img/**/*.{png,jpg,jpeg,gif}',
      config.build + '/' + config.src + '/**/*.css',
      config.build + '/' + config.src + '/' + config.lib + '/inc/**/*.php'
    ]
  },
  gruntfile: {
    files: [
      'Gruntfile.js',
      'gruntconfig/**/*.js'
    ],
    tasks: ['jshint:gruntfile']
  }
};

module.exports = watch;
