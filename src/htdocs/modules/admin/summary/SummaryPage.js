'use strict';


var TextProductView = require('admin/TextProductView'),
    SummaryPage = require('summary/SummaryPage'),

    Product = require('Product'),
    ProductActionsView = require('admin/ProductActionsView'),
    TextSummaryDetailsView = require('admin/TextSummaryDetailsView'),
    TextProductView = require('admin/TextProductView');


var __type_to_display = function (type) {
  var tokens = type.split('-'),
      buffer = [];

  tokens.forEach(function (token) {
    buffer.push(token[0].toUpperCase() + token.slice(1));
  });

  return buffer.join(' ');
};


var AdminSummaryPage = function (options) {
  this._textProductButtons = [];
  this._actionViews = [];

  SummaryPage.call(this, options);
};
AdminSummaryPage.prototype = Object.create(SummaryPage.prototype);


/**
 * Override parent method to first do whatever the parent might have done, but
 * then also inject a button to add another textual content product.
 *
 *
 * @see earthquake-eventpages::summary/SummaryPage#_getTexts
 */
AdminSummaryPage.prototype._getTexts = function (type) {
  var button,
      buttonTitle,
      el,
      fragment;

  fragment = SummaryPage.prototype._getTexts.call(this, type);

  // Create a button to add another
  buttonTitle = __type_to_display(type);
  button = document.createElement('button');
  button.classList.add('add-product-button');
  button.setAttribute('product-type', type);
  button.innerHTML = 'Add ' + buttonTitle + ' (' + type + ') ' + ' Product';

  button._clickHandler = this._getAddTextClick();
  button.addEventListener('click', button._clickHandler);
  this._textProductButtons.push(button);

  el = document.createElement('p');
  el.classList.add('alert');
  el.classList.add('info');
  el.appendChild(button);
  fragment.insertBefore(el, fragment.firstChild);

  return fragment;
};

/**
 * Override parent method to first do whatever the parent might have done, but
 * then also inject a button to edit a textual content product.
 *
 *
 * @see earthquake-eventpages::summary/SummaryPage#_getText
 */
AdminSummaryPage.prototype._getText = function (product) {
  var actionsView,
      el;

  el = document.createElement('div');
  el.classList.add('alert');
  el.classList.add('edit-text');

  // add buttons
  actionsView = ProductActionsView({
    editView: TextProductView,
    event: this._event,
    products: [product],
    page: TextSummaryDetailsView()
  });
  el.appendChild(actionsView.el);
  this._actionViews.push(actionsView);

  // add normal content
  el.appendChild(SummaryPage.prototype._getText.call(this, product));

  return el;
};


/**
 * Override parent method to additionally clean up resources/references added
 * by this subclass.
 *
 * @see earthquake-eventpages::summary/SummaryPage#destroy
 */
AdminSummaryPage.prototype.destroy = function () {
  SummaryPage.prototype.destroy.apply(this);

  this._textProductButtons.forEach(function (button) {
    button.removeEventListener('click', button._clickHandler);
    button._clickHandler = null;
  }, this);
  this._textProductButtons = null;

  this._actionViews.forEach(function (view) {
    view.destroy();
  });
  this._actionViews = null;
};

/**
 * Create an add text callback.
 *
 * @return {Function}
 *         click event handler to add a text product.
 */
AdminSummaryPage.prototype._getAddTextClick = function () {
  var eventDetails = this._event;

  return function (e) {
    var button = e.target;

    TextProductView({
      type: button.getAttribute('product-type'),
      source: 'admin',
      code: eventDetails.id + '-' + (new Date()).getTime(),
      eventSource: eventDetails.properties.net,
      eventSourceCode: eventDetails.properties.code,
      modalTitle: button.innerHTML
    }).show();
  };
};

/**
 * Create an edit text callback.
 *
 * @param product {Product}
 *        the product to edit.
 * @return {Function}
 *         click event handler to edit a text product.
 */
AdminSummaryPage.prototype._getEditTextClick = function (product) {
  return function (e) {
    var button = e.target;

    TextProductView({
      modalTitle: button.innerHTML,
      product: Product(product)
    }).show();
  };
};

/**
 * Create an delete text callback.
 *
 * @param product {Product}
 *        the product to edit.
 * @return {Function}
 *         click event handler to edit a text product.
 */
AdminSummaryPage.prototype._getDeleteTextClick = function (product) {
  var _this = this;
  return function () {
    var properties,
        deleteProduct,
        deleteText,
        deleteTitle;

    properties = product.properties;
    deleteProduct = Product({
      source: product.source,
      type: product.type,
      status: Product.STATUS_DELETE,
      code: product.code,
      properties: {
        eventsource: properties.eventsource,
        eventsourcecode: properties.eventsourcecode
      }
    });

    // Set modal title and text
    deleteText = 'The following DELETE product(s) will be sent. ' +
        'Click a product below for more details.';
    deleteTitle = 'Delete Product(s)';
    // Send delete product
    _this._sendProduct([deleteProduct], deleteTitle, deleteText);
  };
};


module.exports = AdminSummaryPage;
