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
  var fragment,
      button;

  fragment = ScientificSummaryPage.prototype.getLinks.call(this);
  // TODO add scitech-link button
  button = document.createElement('button');
  button.innerHTML = 'Add Link';

  button.addEventListener('click', this.modalView);
  fragment.appendChild(button);
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

AdminScientificSummaryPage.prototype.modalView = function () {
  //calls modal view
  EditLinkView({

  }).show();
};

module.exports = AdminScientificSummaryPage;
