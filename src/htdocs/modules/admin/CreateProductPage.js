'use strict';

var EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util'),

    Product = require('Product'),
    SendProductView = require('admin/SendProductView'),
    FileUploadView = require('FileUploadView');


var CreateProductPage = function (options) {
  options = Util.extend({}, options || {});

  this._sendProductButton = null;
  this._sendProductView = null;

  EventModulePage.call(this, options);
};
CreateProductPage.prototype = Object.create(EventModulePage.prototype);


CreateProductPage.prototype._setContentMarkup = function () {
  var el = this._content,
      uploadView;

  el.innerHTML = '<button class="sendProduct">Send Product</button>' +
      '<div class="myfileupload"></div>';
  this._sendProductButton = el.querySelector('.sendProduct');

  this._onSendProductClick = this._onSendProductClick.bind(this);
  this._sendProductButton.addEventListener('click', this._onSendProductClick);

  uploadView = FileUploadView({
    el: el.querySelector('.myfileupload')
  });

  uploadView.on('upload', function (file) {
    console.log(file);
  });
  uploadView.on('uploaderror', function (xhr) {
    console.log(xhr);
  });
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
