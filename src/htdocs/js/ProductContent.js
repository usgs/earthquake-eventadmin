'use strict';

var Model = require('mvc/Model'),

    Util = require('util/Util');

var ProductContent = function (options) {
  var _this,
      _initialize;


  _this = Model(Util.extend({
    contentType: 'text/plain',
    id: null,
    lastModified: (new Date()).getTime(),
    length: 0,
    path: null
  }, options));

  _initialize = function (options) {
    var bytes = _this.get('bytes'),
        path = _this.get('path'),
        url = _this.get('url');

    if (bytes === null && url === null) {
      throw new Error('Invalid product contents. Must have one of bytes or ' +
          'url.');
    }

    if (bytes !== null && bytes.length !== _this.get('length')) {
      throw new Error('Invalid product contents. Actual length and claimed ' +
          'length differ.');
    }

    if (path === null) {
      throw new Error('Invalid product contents. A path must be specified.');
    }

    _this.set({id: options.id || path}, {silent: true});
  };

  _initialize(options);
  options = null;
  return _this;
};

module.exports = ProductContent;
