'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),

    EditProductView,
    EventModulePage = require('./AdminEventModulePage'),
    Product = require('Product'),
    ProductFactory = require('./ProductFactory'),
    ProductDetailsView = require('./ProductDetailsView'),
    ProductHistoryView = require('./ProductHistoryView');


var ModalView = require('mvc/ModalView');
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


var DEFAULTS = {
  deleteProduct: true,
  editProduct: true,
  editProductView: EditProductView,
  trumpProduct: true,
  viewDetails: false,
  viewHistory: true,
  viewHistoryPage: null
};


/**
 * Actions for a specific product.
 *
 * @param options {Object}
 *        options are passed to view.
 * @param options.deleteProduct {Boolean}
 *        include "delete" action.
 * @param options.editProduct {Boolean}
 *        include "edit" action.
 * @param options.editView {View}
 *        default EditProductView.
 *        view for editing product.
 * @param options.event {Object}
 *        geojson event data.
 * @param options page {SummaryDetailsPage}
 *        page for ProductHistoryView.
 * @param options.product {Object}
 *        geojson product object.
 * @param options.productFactory {ProductFactory}
 *        default ProductFactory().
 *        factory for products.
 * @param options.trumpProduct {Boolean}
 *        include "trump" action.
 * @param options.viewHistory {Boolean}
 *        include "view history" action.
 */
var ProductActionsView = function (options) {
  var _this,
      _initialize,
      // variables
      _buttons,
      _deleteProduct,
      _editProduct,
      _editView,
      _event,
      _page,
      _products,
      _productFactory,
      _trumpProduct,
      _viewDetails,
      _viewHistory,
      // methods
      _addButton,
      _sendProduct;

  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, DEFAULTS, options);
    _deleteProduct = options.deleteProduct;
    _editProduct = options.editProduct;
    _editView = options.editView || EditProductView;
    _event = options.event;
    _page = options.page;
    _products = options.products;
    _productFactory = options.productFactory || ProductFactory();
    _trumpProduct = options.trumpProduct;
    _viewDetails = options.viewDetails;
    _viewHistory = options.viewHistory;

    el = _this.el;
    el.classList.add('product-action-view');
    el.classList.add('button-group');

    _buttons = [];

    if (_viewDetails) {
      _addButton({
        className: 'details',
        handler: _this.onViewDetails,
        text: 'View Details'
      });
    }

    if (_viewHistory) {
      _addButton({
        className: 'history',
        handler: _this.onViewHistory,
        text: 'View History'
      });
    }

    if (_editProduct) {
      _addButton({
        className: 'edit',
        handler: _this.onEditProduct,
        text: 'Edit Product'
      });
    }

    if (_deleteProduct) {
      _addButton({
        className: 'delete',
        handler: _this.onDeleteProduct,
        text: 'Delete Product'
      });
    }

    if (_trumpProduct) {
      _addButton({
        className: 'trump',
        handler: _this.onTrumpProduct,
        text: 'Trump Product'
      });
    }
  };

  /**
   * Add a button to the view.
   *
   * @param options {Object}
   * @param options.className {String}
   *        button class.
   * @param options.text {String}
   *        button text.
   * @param options.handler {Function}
   *        click handler for button.
   */
  _addButton = function (options) {
    var button,
        className,
        handler,
        text;

    className = options.className;
    handler = options.handler;
    text = options.text;

    button = document.createElement('button');
    button.classList.add(className);
    button.innerHTML = text;

    button.addEventListener('click', handler);
    button._clickHandler = handler;
    _buttons.push(button);

    _this.el.appendChild(button);
    return button;
  };


  /**
   * Reuse send product from EventModulePage.
   */
  _sendProduct = EventModulePage.prototype._sendProduct;

  /**
   * Edit Product button click handler.
   */
  _this.onEditProduct = function (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    _editView({
      product: Product(_products[0])
    }).show();
  };

  /**
   * Delete Product button click handler.
   */
  _this.onDeleteProduct = function (e) {
    var deleteProducts,
        deleteText,
        deleteTitle;

    if (e.preventDefault) {
      e.preventDefault();
    }

    deleteProducts = _products.map(_productFactory.getDelete);
    // Set modal title and text
    deleteText = 'The following DELETE product(s) will be sent. ' +
        'Click a product below for more details.';
    deleteTitle = 'Delete Product(s)';
    // Send delete product
    _sendProduct(deleteProducts, deleteTitle, deleteText);
  };

  /**
   * Trump Product button click handler.
   */
  _this.onTrumpProduct = function (e) {
    var trumpProducts,
        trumpText,
        trumpTitle;

    if (e.preventDefault) {
      e.preventDefault();
    }

    trumpProducts = _products.map(_productFactory.getTrump);
    trumpText = 'The following TRUMP product(s) will be sent. ' +
        'Click a product below for more details.';
    trumpTitle = 'Trump Product(s)';
    _sendProduct(trumpProducts, trumpTitle, trumpText);
  };

  /**
   * View Details button click handler.
   */
  _this.onViewDetails = function (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    ProductDetailsView({
      editView: _editView,
      page: _page,
      product: _products[0]
    });
  };

  /**
   * View History button click handler.
   */
  _this.onViewHistory = function (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    ProductHistoryView({
      editView: _editView,
      eventDetails: _event,
      page: _page,
      product: _products[0]
    });
  };

  /**
   * View destroy method.
   */
  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return;
    }

    _buttons.forEach(function (button) {
      button.removeEventListener('click', button._clickHandler);
    });

    _buttons = null;
    _event = null;
    _page = null;
    _products = null;
    _sendProduct = null;
    _this = null;
  }, _this.destroy);


  /**
   * Factory method to create new ProductActionsView based on this view.
   *
   * @param options {Object}
   *        options to override any settings of this view.
   * @return {ProductActionsView}
   *         new view object.
   */
  _this.newActionsView = function (options) {
    return ProductActionsView(Util.extend(
        // current options
        {
          deleteProduct: _deleteProduct,
          editProduct: _editProduct,
          editView: _editView,
          event: _event,
          page: _page,
          products: _products,
          productFactory: _productFactory,
          trumpProduct: _trumpProduct,
          viewHistory: _viewHistory
        },
        // override options
        options));
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = ProductActionsView;
