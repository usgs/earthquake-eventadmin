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


  _getButtons = function (product) {
    var buttons = document.createElement('div'),
        editButton;

    editButton = document.createElement('button');
    editButton.innerHTML = 'Edit Product';
    editButton.addEventListener('click', _editProduct.bind(this));

    // preserve this order
    buttons.appendChild(editButton);

    buttons.classList.add('button-group');
    buttons.classList.add('summary-actions');
    buttons.setAttribute('data-id', product.id);

    return buttons;
  };

  _editProduct = function (e) {
    console.log('edit product');
    console.log(e.target.parentElement.getAttribute('data-id'));
  };

  _viewProductDetails = function (e) {
    // TODO, grab data attribute off summary element
    var dataid = e.currentTarget.getAttribute('data-id');

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
      _section.appendChild(_getButtons(_products[i]));
    }
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {

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
