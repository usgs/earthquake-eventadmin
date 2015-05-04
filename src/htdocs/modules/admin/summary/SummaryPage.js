'use strict';


var TextProductView = require('admin/TextProductView'),
    SummaryPage = require('summary/SummaryPage'),

    Product = require('Product');


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
  button.classList.add('green');
  button.classList.add('create-text-button');
  button.setAttribute('product-type', type);
  button.innerHTML = 'Create ' + buttonTitle;

  button._clickHandler = this._getAddTextClick();
  button.addEventListener('click', button._clickHandler);
  this._textProductButtons.push(button);

  if (fragment.firstChild) {
    fragment.appendChild(button);
  } else {
    el = document.createElement('p');
    el.classList.add('alert');
    el.classList.add('info');
    el.classList.add('no-product-warning');
    el.innerHTML = 'No &ldquo;' + buttonTitle + '&rdquo; (' + type + ')' +
        ' products exist yet.  If/when such a product is created,' +
        ' it will appear here.';
    el.appendChild(button);
    fragment.appendChild(el);
  }

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
  var buttonEl,
      buttonTitle,
      editButton,
      deleteButton,
      el;

  el = document.createElement('div');
  el.classList.add('edit-text');

  // add normal content
  el.appendChild(SummaryPage.prototype._getText.call(this, product));

  // now add buttons
  buttonEl = document.createElement('div');
  buttonEl.classList.add('button-group');
  el.appendChild(buttonEl);

  buttonTitle = __type_to_display(product.type);
  // edit button
  editButton = document.createElement('button');
  editButton.innerHTML = 'Edit ' + buttonTitle;
  editButton._clickHandler = this._getEditTextClick(product);
  editButton.addEventListener('click', editButton._clickHandler);
  this._textProductButtons.push(editButton);
  buttonEl.appendChild(editButton);

  deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete ' + buttonTitle;
  deleteButton._clickHandler = this._getDeleteTextClick(product);
  deleteButton.addEventListener('click', deleteButton._clickHandler);
  this._textProductButtons.push(deleteButton);
  buttonEl.appendChild(deleteButton);

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
