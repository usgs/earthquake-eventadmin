'use strict';

var EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util'),

    Product = require('Product'),
    ProductSender = require('ProductSender');


var CreateProductPage = function (options) {
  options = Util.extend({}, options || {});

  EventModulePage.call(this, options);
};
CreateProductPage.prototype = Object.create(EventModulePage.prototype);


CreateProductPage.prototype._setContentMarkup = function () {
  var el = this._content,
      products = this._event.properties.products;

  el.innerHTML = '<button class="sendProduct">Send Product</button>' +
      '<div class="sendResult"></div>';
  var sendProduct = this._content.querySelector('.sendProduct');
  sendProduct.addEventListener('click', function () {
    var product = Product(products.origin[0]);
    var productSender = ProductSender();
    productSender.sendProduct(product, function (status, xhr, data) {
      var result = el.querySelector('.sendResult');
      result.innerHTML = status + (data ? '<pre>' + data + '</pre>' : '');
    });
  });
};


module.exports = CreateProductPage;
