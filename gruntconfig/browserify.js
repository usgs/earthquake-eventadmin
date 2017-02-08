'use strict';

var config = require('./config');


var CWD = process.cwd(),
    NODE_MODULES = CWD + '/node_modules';

var browserify = {
  options: {
    browserifyOptions: {
      debug: true,
      paths: [
        CWD + '/' + config.src + '/htdocs/js',
        CWD + '/' + config.src + '/htdocs/modules',
        NODE_MODULES + '/hazdev-cache-invalidator/src/htdocs/js',
        NODE_MODULES + '/hazdev-webutils/src'
      ]
    }
  },

  // source bundles
  index: {
    src: [config.src + '/htdocs/js/index.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/index.js'
  },

  event: {
    src: [config.src + '/htdocs/js/event.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/event.js'
  },

  products: {
    src: [config.src + '/htdocs/js/products.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/products.js'
  },

  // test bundle
  test: {
    src: config.test + '/test.js',
    dest: config.build + '/' + config.test + '/test.js'
  }
};


module.exports = browserify;
