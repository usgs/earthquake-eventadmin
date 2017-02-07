'use strict';

var gruntConfig = {
  config: require('./config'),
  browserify: require('./browserify'),
  clean: require('./clean'),
  concurrent: require('./concurrent'),
  connect: require('./connect'),
  copy: require('./copy'),
  eslint: require('./eslint'),
  mocha_phantomjs: require('./mocha_phantomjs'),
  postcss: require('./postcss'),
  uglify: require('./uglify'),
  watch: require('./watch'),

  tasks: [
    'grunt-browserify',
    'grunt-concurrent',
    'grunt-connect-proxy',
    'grunt-connect-rewrite',
    'grunt-contrib-clean',
    'grunt-contrib-connect',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-mocha-phantomjs',
    'grunt-postcss',
    'gruntify-eslint'
  ]
};

module.exports = gruntConfig;
