'use strict';

var ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View');


var ProductDetailsView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _actionsView,
      _page,
      _product,
      _section;

  _this = View(options);

  _initialize = function (options) {
    var el = _this.el;

    _page = options.page;
    _product = options.product;

    _actionsView = options.actionsView.newActionsView({
      product: _product,
      deleteProduct: false,
      trumpProduct: false,
      viewHistory: false
    });

    _section = document.createElement('section');
    _section.className = 'product-details';
    el.appendChild(_section);

    _this.render();

    _dialog = ModalView(_section, {
      title: 'Product Details',
      closable: true
    });
    _dialog.show();
  };

  _this.render = function () {
    var el = _page.getDetailsContent(_product);

    // call getSummaryContent and append the content to the modal dialog
    _section.appendChild(_actionsView.el);
    _section.appendChild(el);
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {
    // variables
    if (_dialog !== null) {
      _dialog.off();
      _dialog.hide();
      _dialog.destroy();
      _dialog = null;
    }

    if (_this === null) {
      return;
    }

    _actionsView.destroy();

    _actionsView = null;
    _page = null;
    _section = null;
    _this = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};

module.exports = ProductDetailsView;
