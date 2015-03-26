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
      result.classList.add('alert');
      if (status === 200) {
        result.classList.remove('error');
        result.classList.add('info');
      } else {
        result.classList.remove('info');
        result.classList.add('error');
        data = xhr.responseText;
      }

      result.innerHTML = status +
          '<pre>' +
          (typeof data === 'string' ? data :
              JSON.stringify(data, null, 2)) +
          '</pre>';
    });
  });
};


module.exports = CreateProductPage;
