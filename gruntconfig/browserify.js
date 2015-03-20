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
        NODE_MODULES + '/hazdev-webutils/src'
      ]
    }
  },

  // source bundles
  index: {
    src: [config.src + '/htdocs/js/index.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/index.js'
  },

  // test bundle
  test: {
    src: config.test + '/test.js',
    dest: config.build + '/' + config.test + '/test.js'
  }
};


module.exports = browserify;
