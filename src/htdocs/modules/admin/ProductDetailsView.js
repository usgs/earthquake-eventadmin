'use strict';

var CatalogEvent = require('CatalogEvent'),

    ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View');

var ProductDetailsView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _el,
      _event,
      _page,
      _product,
      _section;

  _this = View(options);

  _initialize = function () {

    _el = _this.el;
    _page = options.page;

    _section = document.createElement('section');
    _section.className = 'product-details';
    _el.appendChild(_section);

    // get event
    _event = CatalogEvent(options.eventDetails);

    // get products
    _product = options.product;

    // render the view
    _this.render();

    _dialog = ModalView(_section, {
      title: 'Product Details',
      closable: true
    });
    _dialog.show();

    options = null;
  };


  _this.render = function () {
    var el = _page.getDetailsContent(_product);

    // call getSummaryContent and append the content to the modal dialog
    _section.appendChild(el);
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
      _product = null;
      _section = null;
  }, _this.destroy);

  _initialize();
  return _this;
};

module.exports = ProductDetailsView;
