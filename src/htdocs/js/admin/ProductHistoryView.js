'use strict';


var CatalogEvent = require('admin/CatalogEvent'),
    ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View');


/**
 * A view for rendering the history of a single product. This view is rendered
 * in a dialog.
 *
 */
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

  _initialize = function (options) {
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
      closable: true,
    });
    _dialog.show();
  };

  _this.render = function () {
    var actionView,
        el,
        metaEl,
        product,
        summary,
        updateTime;

    product = _products[0];
    _section.innerHTML = '<dl class="vertical">' +
        '<dt>Source</dt><dd>' + product.source + '</dd>' +
        '<dt>Type</dt><dd>' + product.type + '</dd>' +
        '<dt>Code</dt><dd>' + product.code + '</dd>' +
        '</dl>';

    for (var i = 0; i < _products.length; i++) {
      product = _products[i];
      updateTime = new Date(product.updateTime);

      el = document.createElement('div');
      el.classList.add('alert');

      metaEl = document.createElement('div');
      metaEl.classList.add('metadata');
      metaEl.innerHTML = updateTime.toISOString()
          .replace('T', ' ')
          .replace(/\.[\d]+Z/, ' UTC');
      el.appendChild(metaEl);

      actionView = _actionsView.newActionsView({
        products: [product],
        viewHistory: false,
        deleteProduct: false,
        trumpProduct: false,
      });
      _actionViews.push(actionView);
      el.appendChild(actionView.el);

      // call buildSummaryMarkup and append the content to the modal dialog
      summary = _page.buildSummaryMarkup(product);
      if (i !== 0) {
        summary.classList.add('superseded');
      }
      if (product.status.toUpperCase() === 'DELETE') {
        summary.classList.add('deleted');
      }
      actionView._summaryEl = el;
      summary.addEventListener('click', actionView.onViewDetails);
      el.appendChild(summary);

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


  _initialize(options);
  options = null;
  return _this;
};

module.exports = ProductHistoryView;
