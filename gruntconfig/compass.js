'use strict';

var config = require('./config');

var CWD = process.cwd(),
    NODE_MODULES = CWD + '/node_modules';


var compass = {
  dev: {
    options: {
      sassDir: config.src,
      cssDir: config.build + '/' + config.src,
      environment: 'development',
      importPath: [
        CWD + '/' + config.src + '/htdocs',
        NODE_MODULES + '/hazdev-template/src',
        NODE_MODULES + '/hazdev-webutils/src'
      ]
    }
  }
};

module.exports = compass;
