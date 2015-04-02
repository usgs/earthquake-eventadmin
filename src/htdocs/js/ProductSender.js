'use strict';


var Util = require('util/Util'),
    Xhr = require('util/Xhr');


var DEFAULTS = {
  url: 'send_product.php'
};


/**
 * Class for sending products.
 *
 * @param options {Object}
 * @param options.url {String}
 *        url where products are sent.
 */
var ProductSender = function (options) {
  var _this,
      _initialize,
      // variables
      _url;

  _this = {};

  _initialize = function () {
    options = Util.extend({}, DEFAULTS, options);
    _url = options.url;
    options = null;
  };


  /**
   * Send a product.
   *
   * @param product {Product}
   *        product to send.
   * @param callback {Function(status, xhr, data)}
   *        callback function after send is complete.
   *        callback parameters:
   *          status: status code (200 when no errors),
   *          xhr: the xhr object
   *          data: data as returned by Xhr.ajax.
   */
  _this.sendProduct = function (product, callback) {
    // post product to send_product.php
    Xhr.ajax({
      url: _url,
      method: 'POST',
      data: {
        product: JSON.stringify(product)
      },
      success: function (data, xhr) {
        callback(xhr.status, xhr, Util.extend({product: product}, data));
      },
      error: function (status, xhr) {
        var data;

        try {
          data = JSON.parse(xhr.responseText);
        } catch (e) {
          data = {
            error: xhr.responseText
          };
        }

        callback(status, xhr, Util.extend({product: product}, data));
      }
    });
  };


  _initialize();
  return _this;
};


module.exports = ProductSender;
