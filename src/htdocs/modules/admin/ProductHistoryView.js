'use strict';

var ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    Tensor = require('scientific/tensor/Tensor'),

    CatalogEvent = require('CatalogEvent'),
    EditProductView,
    Product = require('Product'),
    ProductDetailsView = require('admin/ProductDetailsView');


EditProductView = function (options) {
  var _this,
      _modal;

  _this = View(options);
  _this.el.innerHTML = JSON.stringify(options.product);

  _modal = ModalView(_this.el, {
    closable: true,
    title: 'Edit Product View'
  });

  _this.hide = _modal.hide;
  _this.show = _modal.show;

  return _this;
};


var ProductHistoryView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _editView,
      _el,
      _event,
      _page,
      _products = [],
      _section,

      // methods
      _editProduct,
      _getButtons,
      _viewProductDetails;

  _this = View(options);

  _initialize = function () {
    var product;

    _el = _this.el;
    _page = options.page;

    _section = document.createElement('section');
    _section.className = 'product-history';
    _el.appendChild(_section);

    _editView = options.editView || EditProductView;

    // get event
    _event = CatalogEvent(options.eventDetails);

    // get products
    product = options.product;
    _products = _event.getAllProductVersions(
        product.type,
        product.source,
        product.code
      );

    // render the view
    _this.render();

    _dialog = ModalView(_section, {
      title: 'Product History',
      closable: true
    });
    _dialog.show();

    options = null;
  };


  _getButtons = function (product, dataid) {
    var buttons = document.createElement('div'),
        editButton,
        editProduct;

    // button group
    buttons.classList.add('button-group');
    buttons.classList.add('summary-actions');
    buttons.setAttribute('data-id', dataid);

    // add button
    editButton = document.createElement('button');
    editButton.innerHTML = 'Edit Product';
    buttons.appendChild(editButton);

    editProduct = _editProduct.bind(this);
    editButton.addEventListener('click', editProduct);

    buttons.destroy = function () {
      editButton.removeEventListener('click', editProduct);
      editProduct = null;
      editButton = null;
      buttons = null;
    };

    return buttons;
  };

  _editProduct = function (e) {
    var product = _products[e.currentTarget.parentElement.getAttribute('data-id')];

    _editView({
      product: Product(product)
    }).show();
  };

  _viewProductDetails = function (e) {
    var dataid = e.currentTarget.getAttribute('data-id');

    // keep the hash from updating
    e.preventDefault();

    ProductDetailsView({
      editView: _editView,
      page: _page,
      product: _products[dataid]
    });
  };

  _this.render = function () {
    var el,
        product;

    for (var i = 0; i < _products.length; i++) {
      product = _products[i];
      // get tensor information for MT and FM
      if (product.type === 'moment-tensor' || product.type === 'focal-mechanism') {
        product = Tensor.fromProduct(product);
      }
      // append buttons
      _section.appendChild(_getButtons(product, i));

      // call buildSummaryMarkup and append the content to the modal dialog
      el = _page.buildSummaryMarkup(product);
      el.setAttribute('data-id', i);
      el.addEventListener('click', _viewProductDetails);
      _section.appendChild(el);
      if (i !== 0) {
        el.classList.add('superseded');
      }
    }
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {

    var buttons = [],
        summaries = [];

    // unbind all buttons
    buttons = _section.querySelectorAll('.button-group');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i]._destroy();
    }

    summaries = _section.querySelectorAll('.summary');
    for (i = 0; i < summaries.length; i ++) {
      summaries[i].removeEventListener('click', _viewProductDetails);
    }

    // variables
    if (_dialog !== null) {
      _dialog.destroy();
      _dialog = null;
    }
      _el = null;
      _event = null;
      _page = null;
      _products = null;
      _section = null;
  }, _this.destroy);

  _initialize();
  return _this;
};

module.exports = ProductHistoryView;
