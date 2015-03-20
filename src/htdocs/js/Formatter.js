'use strict';

var Util = require('util/Util');


var DEFAULTS = {
  empty: '&ndash;',
  round: null
};

var Formatter = function (options) {
  var _empty,
      _initialize,
      _round,
      _this;

  // create instance object
  _this = Object.create({});

  _initialize = function () {
    options = Util.extend({}, DEFAULTS, options);
    _empty = options.empty;
    _round = options.round;
  };

  /**
   * Format a difference between two values.
   *
   * Parameters <code>reference</code> and <code>value</code>
   * should be of the same type.
   *
   * @param reference {Number|Date}
   *        reference value.
   * @param value {Number|Date}
   *        comparison value.
   * @return {String} formatted date.
   */
  _this.diff = function (reference, value) {
    var diff,
        formatted;
    if (reference === null || typeof reference === 'undefined' ||
        value === null || typeof value === 'undefined') {
      // if either is undefined, so is difference
      return _empty;
    }
    diff = value - reference;
    if (value instanceof Date) {
      formatted = _this.duration(diff);
    } else {
      formatted = _this.round(Math.abs(diff));
    }
    return (diff >= 0 ? '+' : '-') + formatted;
  };

  /**
   * Format a time duration.
   *
   * @param ms {Integer}
   *        duration in milliseconds.
   * @return {String} formatted duration.
   */
  _this.duration = function (ms) {
    var formatted,
        d,h,m,s;
    if (ms === null || typeof ms === 'undefined') {
      return _empty;
    }
    d = null;
    h = null;
    m = null;
    s = parseInt(Math.abs(ms) / 1000, 10);
    if (s >= 60) {
      m = parseInt(s / 60, 10);
      s = s % 60;
      if (m >= 60) {
        h = parseInt(m / 60, 10);
        m = m % 60;
        s = null;
        if (h >= 24) {
          d = parseInt(d / 24, 10);
          h = h % 24;
          m = null;
        }
      }
    }
    formatted = '' +
        (d !== null ? d + 'd' : '') +
        (h !== null ? h + 'h' : '') +
        (m !== null ? m + 'm' : '') +
        (s !== null ? s + 's' : '');
    return formatted;
  };

  /**
   * Format a time.
   *
   * @param value {Date}
   *        Date object to format.
   * @return {String} formatted time.
   */
  _this.time = function (value) {
    var h,
        m,
        s,
        ms;
    if (value === null || typeof value === 'undefined') {
      return _empty;
    }
    h = value.getUTCHours();
    m = value.getUTCMinutes();
    s = value.getUTCSeconds();
    ms = value.getUTCMilliseconds();
    return (h < 10 ? '0' : '') + h + ':' +
        (m < 10 ? '0' : '') + m + ':' +
        (s < 10 ? '0' : '') + s + '.' +
        (ms < 10 ? '0' : '') + (ms < 100 ? '0' : '') + ms;
  };

  _this.round = function (value) {
    var scale;
    if (_round === null) {
      return value;
    }
    scale = Math.pow(10, _round);
    return Math.round(value * scale) / scale;
  };

  _initialize();
  return _this;
};


module.exports = Formatter;
