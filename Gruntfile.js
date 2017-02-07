'use strict';

module.exports = function (grunt) {

  var gruntConfig = require('./gruntconfig');

  gruntConfig.tasks.forEach(grunt.loadNpmTasks);
  grunt.initConfig(gruntConfig);

  grunt.event.on('watch', function (action, filepath) {
    // Only lint the file that actually changed
    grunt.config(['jshint', 'scripts'], filepath);
  });

  grunt.registerTask('test', [
    'clean:build',
    'concurrent:build',
    'connect:test',
    'mocha_phantomjs'
  ]);

  grunt.registerTask('build', [
    'clean:build',
    'copy:eventpages',
    'copy:invalidator',
    'concurrent:build'
  ]);

  grunt.registerTask('eventadmin', function () {
    try {
      var fs = require('fs'),
          stats = fs.lstatSync(gruntConfig.config.dist);
      if (!stats.isDirectory()) {
        throw new Error('dist is not a diretory');
      }
    } catch (e) {
      // build if dist doesn't exist
      grunt.task.run([
        'build',
        'clean:dist',
        'concurrent:dist'
      ]);
    }

    grunt.task.run([
      'connect:template',
      'configureRewriteRules',
      'configureProxies:dist',
      'connect:dist'
    ]);
  });

  grunt.registerTask('dist', [
    'build',
    'clean:dist',
    'concurrent:dist',
    'connect:template',
    'configureRewriteRules',
    'configureProxies:dist',
    'connect:dist'
  ]);

  grunt.registerTask('default', [
    'build',
    'configureRewriteRules',
    'connect:template',
    'configureProxies:dev',
    'configureProxies:test',
    'connect:dev',
    'connect:test',
    'mocha_phantomjs',
    'watch'
  ]);

};
