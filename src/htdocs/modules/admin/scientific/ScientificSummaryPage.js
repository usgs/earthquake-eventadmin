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
  var button,
      fragment;
  fragment = document.createDocumentFragment();

  fragment.appendChild(
    ScientificSummaryPage.prototype.getLink.call(this, product)
  );

  button = document.createElement('button');
  button.classList.add('edit-link-button');
  button.innerHTML = 'Edit Link';
  button.setAttribute('data-product-id', product.id);
  button.addEventListener('click', this.onEditClick);
  fragment.appendChild(button);

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

module.exports = AdminScientificSummaryPage;
