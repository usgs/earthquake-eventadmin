'use strict';

var ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    Tensor = require('scientific/tensor/Tensor'),

    CatalogEvent = require('CatalogEvent');


var ProductHistoryView = function (options) {
  var _this,
      _initialize,

      // variables
      _actionsView,
      _actionViews,
      _dialog,
      _el,
      _event,
      _page,
      _products = [],
      _section;

  _this = View(options);

  _initialize = function () {
    var product;

    _el = _this.el;
    _page = options.page;

    _section = document.createElement('section');
    _section.className = 'product-history';
    _el.appendChild(_section);

    _actionViews = [];
    _actionsView = options.actionsView;

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

  _this.render = function () {
    var actionView,
        el,
        product;

    for (var i = 0; i < _products.length; i++) {
      product = _products[i];
      // get tensor information for MT and FM
      if (product.type === 'moment-tensor' || product.type === 'focal-mechanism') {
        product = Tensor.fromProduct(product);
      }

      // call buildSummaryMarkup and append the content to the modal dialog
      el = _page.buildSummaryMarkup(product);
      if (i !== 0) {
        el.classList.add('superseded');
      }

      // prepend buttons
      actionView = _actionsView.newActionsView({
        product: product,
        viewHistory: false,
        deleteProduct: false,
        trumpProduct: false,
      });
      el.insertBefore(actionView.el, el.firstChild);
      actionView._summaryEl = el;
      el.addEventListener('click', actionView.onViewDetails);
      _actionViews.push(actionView);

      _section.appendChild(el);
    }
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {
    if (_dialog !== null) {
      _dialog.off();
      _dialog.hide();
      _dialog.destroy();
      _dialog = null;
    }

    if (_this === null) {
      return;
    }

    _actionViews.forEach(function (view) {
      if (view._summaryEl) {
        view._summaryEl.removeEventListener('click', view.onViewDetails);
        view._summaryEl = null;
      }
      view.destroy();
    });

    _actionViews = null;
    _event = null;
    _page = null;
    _products = null;
    _section = null;
    _this = null;
  }, _this.destroy);

  _initialize();
  return _this;
};

module.exports = ProductHistoryView;
