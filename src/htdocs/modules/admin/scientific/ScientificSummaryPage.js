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
  this.onAddClick = this.onAddClick.bind(this);
  this.onEditClick = this.onEditClick.bind(this);
  this.onAddButton = null;
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
  button.addEventListener('click', this.onAddClick);
  this.onAddButton = button;
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
  editButton.addEventListener('click', this.onEditClick);
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
AdminScientificSummaryPage.prototype.onEditClick = function (evt) {
  var button,
      id,
      product;

  button = evt.target;
  id = button.getAttribute('data-product-id');

  this._event.properties.products['scitech-link'].some(function (p) {
    if (p.id === id) {
      product = Product(p);
      return true;
    }
  });

  if (product) {
    EditLinkView({
      product: product
    }).show();
  }
};


/**
* Calls EditLinkView Modal
*/
AdminScientificSummaryPage.prototype.onAddClick = function () {
  var props = this._event.properties,
      time = new Date().getTime();

  //calls modal view
  EditLinkView({
    type: 'scitech-link',
    source: 'admin',
    code: props.net + '-' + props.code + '-' + props.url +'-'+ time,
    eventSource: props.net,
    eventSourceCode: props.code
  }).show();
};

/**
 * Removed event listeners and sets valuse to null
 */
AdminScientificSummaryPage.prototype.destroy = function () {
  ScientificSummaryPage.prototype.destroy.apply(this);

  this._productButtons.forEach(function (button) {
    button.removeEventListener('click', this.onAddClick);
    button.removeEventListener('click', this.onEditClick);
  }, this);

  this._productButtons = null;
};

module.exports = AdminScientificSummaryPage;
