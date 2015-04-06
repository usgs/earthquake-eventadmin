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
      _section,

      // buttons
      _editProduct,
      _getButtons;

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

  _getButtons = function () {
    var buttons = document.createElement('div'),
        editButton,
        editProduct;

    // button group
    buttons.classList.add('button-group');
    buttons.classList.add('summary-actions');

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

  _editProduct = function () {
    var product = _product;

    console.log('edit product');
    console.log(product);
  };

  _this.render = function () {
    var el = _page.getDetailsContent(_product);

    // call getSummaryContent and append the content to the modal dialog
    _section.appendChild(_getButtons(_product));
    _section.appendChild(el);
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {
    var buttons = [];

    // unbind all buttons
    buttons = _section.querySelectorAll('.button-group');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i]._destroy();
    }

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
