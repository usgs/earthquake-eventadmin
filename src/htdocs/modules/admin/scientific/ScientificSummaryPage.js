'use strict';

var ScientificSummaryPage = require('scientific/ScientificSummaryPage'),
    EditLinkView = require('admin/EditLinkView'),

    Product = require('Product');


/**
 * Create a new ScientificSummaryPage.
 * @param options {Object}
 *        module options.
 */
var AdminScientificSummaryPage = function (options) {
  this._productButtons = [];
  ScientificSummaryPage.call(this, options);
};


// extend EventModulePage
AdminScientificSummaryPage.prototype = Object.create(ScientificSummaryPage.prototype);


/**
 * Get any scitech-link information.
 *
 * @return {DocumentFragment}
 *         Fragment with links, or empty if no information present.
 */
AdminScientificSummaryPage.prototype.getLinks = function () {
  var button,
      el,
      fragment;

  fragment = ScientificSummaryPage.prototype.getLinks.call(this);

  el = document.createElement('div');

  el.innerHTML = '<p class="alert no-product-warning info">'+
      'Links can be added here.' +
      '<br/>' +
      '<button class="green create-link-button">Add Link</button>' +
      '</p>';

  button = el.querySelector('.create-link-button');
  button._clickHandler = this.getAddClick();
  button.addEventListener('click', button._clickHandler);
  this._productButtons.push(button);
  fragment.appendChild(el);

  return fragment;
};


/**
 * Create an anchor element from a link product.
 *
 * @param product {Object}
 *        The link product.
 * @return {DocumentFragment}
 *         fragment element.
 */
AdminScientificSummaryPage.prototype.getLink = function (product) {
  var editButton,
      fragment;

  fragment = document.createDocumentFragment();

  fragment.appendChild(
    ScientificSummaryPage.prototype.getLink.call(this, product)
  );

  editButton = document.createElement('button');
  editButton.classList.add('edit-link-button');
  editButton.innerHTML = 'Edit Link';
  editButton.setAttribute('data-product-id', product.id);
  editButton._clickHandler = this.getEditClick(product);
  editButton.addEventListener('click', editButton._clickHandler);
  this._productButtons.push(editButton);
  fragment.appendChild(editButton);

  return fragment;
};


/**
 * Calls EditLinkView modal
 *
 * @param evt (event)
 *        button click event
 */
AdminScientificSummaryPage.prototype.getEditClick = function (product) {
  return function () {
    EditLinkView({
      product: Product(product)
    }).show();
  };
};


/**
* Calls EditLinkView Modal
*/
AdminScientificSummaryPage.prototype.getAddClick = function () {
  var props = this._event.properties,
      time = new Date().getTime();

  return function () {
    EditLinkView({
      type: 'scitech-link',
      source: 'admin',
      code: props.net + '-' + props.code + '-' + props.url +'-'+ time,
      eventSource: props.net,
      eventSourceCode: props.code
    }).show();
  };
};


/**
 * Removed event listeners and sets valuse to null
 */
AdminScientificSummaryPage.prototype.destroy = function () {
  ScientificSummaryPage.prototype.destroy.apply(this);

  this._productButtons.forEach(function (button) {
    button.removeEventListener('click', button._clickHandler);
    button._clickHandler = null;
  }, this);

  this._productButtons = null;
};

module.exports = AdminScientificSummaryPage;
