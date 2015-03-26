'use strict';

var EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util'),

    Product = require('Product'),
    SendProductView = require('SendProductView');


var CreateProductPage = function (options) {
  options = Util.extend({}, options || {});

  EventModulePage.call(this, options);
};
CreateProductPage.prototype = Object.create(EventModulePage.prototype);


CreateProductPage.prototype._setContentMarkup = function () {
  var el = this._content,
      products = this._event.properties.products;

  this.sendProductView = SendProductView({
    el: el,
    product: Product(products.origin[0])
  });
};


module.exports = CreateProductPage;
