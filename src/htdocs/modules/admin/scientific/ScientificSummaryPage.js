'use strict';

var ScientificSummaryPage = require('scientific/ScientificSummaryPage'),
    CatalogEvent = require('CatalogEvent'),
    EditLinkView = require('admin/EditLinkView'),
    LinkSummaryDetailsView = require('admin/LinkSummaryDetailsView'),
    ProductActionsView = require('admin/ProductActionsView');


/**
 * Create a new ScientificSummaryPage.
 * @param options {Object}
 *        module options.
 */
var AdminScientificSummaryPage = function (options) {
  this._productButtons = [];
  this._actionViews = [];

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
      links,
      list;

  el = document.createElement('div');
  el.classList.add('scitech-links');
  el.innerHTML = '<h3>Scientific and Technical Links</h3>' +
      '<ul></ul>';
  list = el.querySelector('ul');

  // add "add" list item
  button = document.createElement('li');
  button.innerHTML = '<div class="alert info">' +
      '<button class="add-product-button">' +
        'Add Scitech Link (scitech-link) product' +
      '</button>' +
      '</div>';
  list.appendChild(button);

  // add click handler
  button = button.querySelector('button');
  button._clickHandler = this._getAddClick();
  button.addEventListener('click', button._clickHandler);
  this._productButtons.push(button);

  // add link products
  links = this._event.properties.products['scitech-link'];
  if (links) {
    links = CatalogEvent.getWithoutSuperseded(links);
    links.forEach(function (product) {
      var el = document.createElement('li');
      el.appendChild(this.getLink(product));
      list.appendChild(el);
    }, this);
  }

  return el;
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
  var actionsView,
      el;

  el = document.createElement('div');
  el.classList.add('edit-link');

  actionsView = ProductActionsView({
    editView: EditLinkView,
    event: this._event,
    page: LinkSummaryDetailsView(),
    products: [product]
  });
  this._actionViews.push(actionsView);

  el.appendChild(actionsView.el);
  el.appendChild(
    ScientificSummaryPage.prototype.getLink.call(this, product)
  );

  return el;
};


/**
* Calls EditLinkView Modal
*/
AdminScientificSummaryPage.prototype._getAddClick = function () {
  var id = this._event.id,
      props = this._event.properties;

  return function () {
    EditLinkView({
      type: 'scitech-link',
      source: 'admin',
      code: 'eventadmin-' + id + '-' + new Date().getTime(),
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

  this._actionViews.forEach(function (view) {
    view.destroy();
  });
  this._actionViews = null;
};


module.exports = AdminScientificSummaryPage;
