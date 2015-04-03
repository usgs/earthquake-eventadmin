'use strict';

var CatalogEvent = require('CatalogEvent'),

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
      _section;

  _this = View(options);

  _initialize = function () {
    var products = [];

    _el = _this.el;
    _page = options.page;

    _section = document.createElement('section');
    _section.className = 'product-history';
    _el.appendChild(_section);

    // get event
    _event = CatalogEvent(options.eventDetails);

    // get products
    products = CatalogEvent.removePhases(options.products);

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

  _this.render = function () {
    // call getSummaryContent and append the content to the modal dialog
    _section.appendChild(_page.getSummaryContent(_products));
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
