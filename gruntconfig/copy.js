'use strict';

var config = require('./config');

var copy = {
  build: {
    expand: true,
    cwd: config.src,
    dest: config.build + '/' + config.src,
    src: [
      '**/*',
      '!**/*.js',
      '!**/*.scss',
      '!**/*.orig'
    ],
    filter: 'isFile'
  },
  test: {
    expand: true,
    cwd: config.test,
    dest: config.build + '/' + config.test,
    src: [
      '**/*',
      '!**/*.js'
    ],
    filter: 'isFile'
  },
  dist: {
    expand: true,
    cwd: config.build + '/' + config.src,
    dest: config.dist,
    src: [
      '**/*',
      '!**/*.js',
      '!**/*.css'
    ],
    filter: 'isFile'
  },

  leaflet: {
    expand: true,
    cwd: 'node_modules/leaflet/dist',
    dest: config.build + '/' + config.src + '/htdocs/lib/leaflet',
    src: [
      'leaflet.css',
      'images/**'
    ]
  },
  locationview_images: {
    expand: true,
    cwd: 'node_modules/hazdev-location-view/src/locationview/images',
    dest: config.build + '/' + config.src + '/htdocs/modules/impact/images',
    src: [
      '*.png',
      '*.cur'
    ]
  },
  eventpages: {
    expand: true,
    cwd: 'node_modules/earthquake-eventpages/src/htdocs',
    dest: config.build + '/' + config.src + '/htdocs',
    src: [
      '**/*',
      '!**/*.js',
      '!**/*.scss',
      '!**/*.orig'
    ],
    filter: 'isFile'
  },

  invalidator: {
    expand: true,
    cwd: 'node_modules/hazdev-cache-invalidator/src',
    dest: config.build + '/' + config.src,
    src: [
      'lib/classes/CacheInvalidator.php',
      'htdocs/invalidate_url.php'
    ]
  }

};

module.exports = copy;
