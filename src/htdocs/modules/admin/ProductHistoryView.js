'use strict';

var CatalogEvent = require('CatalogEvent'),

    Collection = require('mvc/Collection'),
    ModalView = require('mvc/ModalView'),
    ProductsView = require('admin/ProductsView'),
    View = require('mvc/View');

var ProductHistoryView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _el,
      _event,
      _products = [],
      _productTypes = [],
      _section,

      // methods
      _deleteProduct,
      _editProduct,
      _getProductViewByType,
      _preferProduct;

  _this = View(options);

  _initialize = function () {
    var products = [];

    _el = _this.el;

    _section = document.createElement('section');
    _section.className = 'associated-products';
    _el.appendChild(_section);

    // get event
    _event = CatalogEvent(options.eventDetails);

    products = options.products;

    // get products
    for (var i = 0; i < products.length; i++) {
      _products = _products.concat(
          _event.getAllProductVersions(
            products[i].type,
            products[i].source,
            products[i].code
          ));
    }

    // render the view
    _this.render();

    _dialog = ModalView(_section, {
      title: 'Product History',
      closable: true
    });
    _dialog.show();

    options = null;
  };

  _preferProduct = function (e) {
    console.log('triggered _preferProduct');
    console.log(e);
  };

  _editProduct = function (e) {
    console.log('triggered _editProduct');
    console.log(e);
  };

  _deleteProduct = function (e) {
    console.log('triggered _deleteProduct');
    console.log(e);
  };

  _getProductViewByType = function (type) {
    var section,
        products = [];

    // Append Products Collection Table
    section = _section.querySelector('.associated-products-' + type);

    for (var i = 0; i < _products.length; i++) {
      if (type === _products[i].type) {
        products.push(_products[i]);
      }
    }

    // Build Associated Products Collection Table
    ProductsView({
      el: section,
      collection: Collection(products),
      preferredProduct: products[0],
      buttons: [
        {
          title: 'Trump Preferred',
          className: 'trump',
          callback: _preferProduct
        },
        {
          title: 'Edit Product',
          className: 'edit',
          callback: _editProduct
        },
        {
          title: 'Delete Product',
          className: 'delete',
          callback: _deleteProduct
        }
      ]
    });
  };

  _this.render = function () {
    var type = null,
        product = null,
        i;

    for(i = 0; i < _products.length; i++) {
      product = _products[i];
      if (type !== product.type) {
        type = product.type;
        _productTypes.push(type);
        _section.innerHTML = _section.innerHTML + '<h4>' + type + '</h4>' +
            '<section class="associated-products-' + type + '"></section>';
      }
    }

    for(i = 0; i < _productTypes.length; i++) {
      _getProductViewByType(_productTypes[i]);
    }

  };

  _initialize();
  return _this;
};

module.exports = ProductHistoryView;