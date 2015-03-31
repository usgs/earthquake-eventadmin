'use strict';

var Model = require('mvc/Model'),

    Util = require('util/Util');

var ProductContent = function (options) {
  var _this,
      _initialize;


  _this = Model(Util.extend({
    contentType: 'text/plain',
    lastModified: (new Date()).getTime(),
    length: 0
  }, options));

  _initialize = function () {
    var bytes = _this.get('bytes'),
        url = _this.get('url');

    if (bytes === null && url === null) {
      throw new Error('Invalid product contents. Must have one of bytes or ' +
          'url.');
    }

    if (bytes !== null && bytes.length !== _this.get('length')) {
      throw new Error('Invalid product contents. Actual length and claimed ' +
          'length differ.');
    }
  };

  _initialize(options);
  options = null;
  return _this;
};

module.exports = ProductContent;
