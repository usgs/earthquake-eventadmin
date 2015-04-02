'use strict';

var EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util'),

    Product = require('Product'),
    SendProductView = require('admin/SendProductView');


var CreateProductPage = function (options) {
  options = Util.extend({}, options || {});

  this._sendProductButton = null;
  this._sendProductView = null;

  EventModulePage.call(this, options);
};
CreateProductPage.prototype = Object.create(EventModulePage.prototype);


CreateProductPage.prototype._setContentMarkup = function () {
  var el = this._content;

  el.innerHTML = '<button class="sendProduct">Send Product</button>';
  this._sendProductButton = el.querySelector('.sendProduct');

  this._onSendProductClick = this._onSendProductClick.bind(this);
  this._sendProductButton.addEventListener('click', this._onSendProductClick);
};

CreateProductPage.prototype._onSendProductClick = function () {
  var products = this._event.properties.products;

  this._sendProductView = SendProductView({
    product: Product(products.origin[0])
  });
  this._sendProductView.on('cancel', this.onRemove, this);

  this._sendProductView.show();
};

CreateProductPage.prototype.onRemove = function () {
  if (this._sendProductView !== null) {
    this._sendProductView.destroy();
    this._sendProductView = null;
  }
};


CreateProductPage.prototype.destroy = function () {
  this.onRemove();
  this._sendProductButton.removeEventListener(this._onSendProductClick);
  this._onSendProductClick = null;
  this._sendProductButton = null;
};


module.exports = CreateProductPage;
