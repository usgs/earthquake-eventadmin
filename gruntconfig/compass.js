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
        NODE_MODULES,
        NODE_MODULES + '/earthquake-eventpages/src/htdocs/',
        NODE_MODULES + '/hazdev-accordion/src',
        NODE_MODULES + '/hazdev-cache-invalidator/src/htdocs/css',
        NODE_MODULES + '/hazdev-location-view/src',
        NODE_MODULES + '/hazdev-question-view/src',
        NODE_MODULES + '/hazdev-svgimagemap/src',
        NODE_MODULES + '/hazdev-tablist/src',
        NODE_MODULES + '/hazdev-template/src',
        NODE_MODULES + '/hazdev-webutils/src',
        NODE_MODULES + '/quakeml-parser-js/src'
      ]
    }
  },
  eventpages: {
    options: {
      sassDir: NODE_MODULES + '/earthquake-eventpages/src/htdocs/modules',
      cssDir: config.build + '/' + config.src + '/htdocs/modules',
      environment: 'development',
      importPath: [
        NODE_MODULES + '/earthquake-eventpages/src',
        NODE_MODULES + '/hazdev-accordion/src',
        NODE_MODULES + '/hazdev-location-view/src',
        NODE_MODULES + '/hazdev-question-view/src',
        NODE_MODULES + '/hazdev-svgimagemap/src',
        NODE_MODULES + '/hazdev-tablist/src',
        NODE_MODULES + '/hazdev-template/src',
        NODE_MODULES + '/hazdev-webutils/src',
        NODE_MODULES + '/quakeml-parser-js/src'
      ]
    }
  }

};

module.exports = compass;
