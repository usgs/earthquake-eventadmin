'use strict';


var TextProductView = require('admin/TextProductView'),
    SummaryPage = require('summary/SummaryPage'),

    CatalogEvent = require('CatalogEvent'),
    EditLinkView = require('admin/EditLinkView'),
    LinkSummaryDetailsView = require('admin/LinkSummaryDetailsView'),
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
  this._productButtons = [];
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
      fragment,
      texts;

  buttonTitle = __type_to_display(type);
  el = document.createElement('div');
  el.innerHTML = '<p class="alert info">' +
      '<button class="add-product-button" product-type="' + type + '">' +
        'Add ' + buttonTitle + ' (' + type + ') product' +
      '</button>' +
      '</p>';
  button = el.querySelector('button');
  button._clickHandler = this._getAddTextClick();
  button.addEventListener('click', button._clickHandler);
  this._productButtons.push(button);

  fragment = document.createDocumentFragment();
  fragment.appendChild(el);
  texts = this._event.properties.products[type];
  if (texts) {
    texts = CatalogEvent.getWithoutSuperseded(texts);
    texts.forEach(function (product) {
      fragment.appendChild(this._getText(product));
    }, this);
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
  var actionsView,
      el;

  el = document.createElement('div');
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
 * Get For More Information links.
 *
 * @return {DocumentFragment}
 *         Fragment with links, or empty if no information present.
 */
AdminSummaryPage.prototype._getLinks = function () {
  var button,
      el,
      links,
      list;

  el = document.createElement('div');
  el.classList.add('general-link');
  el.innerHTML = '<h3>For More Information</h3>' +
      '<ul></ul>';
  list = el.querySelector('ul');

  // add "add" list item
  button = document.createElement('li');
  button.innerHTML = '<div class="alert info">' +
      '<button class="add-product-button">' +
        'Add General Link (general-link) product' +
      '</button>' +
      '</div>';
  list.appendChild(button);

  // add click handler
  button = button.querySelector('button');
  button._clickHandler = this._getAddLinkClick();
  button.addEventListener('click', button._clickHandler);
  this._productButtons.push(button);

  // add link products
  links = this._event.properties.products['general-link'];
  if (links) {
    links = CatalogEvent.getWithoutSuperseded(links);
    links.forEach(function (product) {
      var el = document.createElement('li');
      el.appendChild(this._getLink(product));
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
AdminSummaryPage.prototype._getLink = function (product) {
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
    SummaryPage.prototype._getLink.call(this, product)
  );

  return el;
};


/**
* Calls EditLinkView Modal
*/
AdminSummaryPage.prototype._getAddLinkClick = function () {
  var id = this._event.id,
      props = this._event.properties;

  return function () {
    EditLinkView({
      type: 'general-link',
      source: 'admin',
      code: 'eventadmin-' + id + '-' + new Date().getTime(),
      eventSource: props.net,
      eventSourceCode: props.code
    }).show();
  };
};


/**
 * Override parent method to additionally clean up resources/references added
 * by this subclass.
 *
 * @see earthquake-eventpages::summary/SummaryPage#destroy
 */
AdminSummaryPage.prototype.destroy = function () {
  SummaryPage.prototype.destroy.apply(this);

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


module.exports = AdminSummaryPage;
