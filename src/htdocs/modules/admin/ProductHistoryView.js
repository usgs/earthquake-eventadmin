'use strict';

var CatalogEvent = require('CatalogEvent'),
    ProductDetailsView = require('admin/ProductDetailsView'),

    ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View');

var ProductHistoryView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
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

    console.log('edit product');
    console.log(product);
  };

  _viewProductDetails = function (e) {
    var dataid = e.currentTarget.getAttribute('data-id');

    // keep the hash from updating
    e.preventDefault();

    ProductDetailsView({
      'eventDetails': this._event,
      'page': _page,
      'product': _products[dataid]
    });
  };

  _this.render = function () {
    var el;

    for (var i = 0; i < _products.length; i++) {
      // call getSummaryContent and append the content to the modal dialog
      el = _page.buildSummaryMarkup(_products[i]);
      el.setAttribute('data-id', i);
      el.addEventListener('click', _viewProductDetails);
      _section.appendChild(el);
      // append buttons
      _section.appendChild(_getButtons(_products[i], i));

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
