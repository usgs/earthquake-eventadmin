'use strict';

var ScientificSummaryPage = require('scientific/ScientificSummaryPage'),
    EditLinkView = require('admin/EditLinkView');


/**
 * Create a new ScientificSummaryPage.
 * @param options {Object}
 *        module options.
 */
var AdminScientificSummaryPage = function (options) {
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
      fragment,
      links,
      products;

  fragment = ScientificSummaryPage.prototype.getLinks.call(this);

  products = this._event.properties.products;
  links = products['scitech-link'];


  // TODO add scitech-link button
  el = document.createElement('div');

  el.innerHTML = '<p class="alert no-product-warning info">'+
      'Links can be added here.' +
      '<br/>' +
      '<button class="green create-link-button">Add Link</button>' +
      '</p>';

  button = el.querySelector('.create-link-button');
  button.addEventListener('click', this.onAddClick.bind(this));
  fragment.appendChild(el);
  return fragment;
};
/**
 * Create an anchor element from a link product.
 *
 * @param product {Object}
 *        The link product.
 * @return {DOMEElement}
 *         anchor element.
 */
AdminScientificSummaryPage.prototype.getLink = function (product) {
  var el;

  el = ScientificSummaryPage.prototype.getLink.call(this, product);
  // TODO edit/add button
  return el;
};

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
