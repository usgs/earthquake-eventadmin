'use strict';

var CatalogEvent = require('CatalogEvent'),

    EditLinkView = require('admin/EditLinkView'),
    TextProductView = require('admin/TextProductView'),
    EditProductView = require('admin/EditProductView'),

    ProductActionsView = require('admin/ProductActionsView'),
    EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util');

var AllProductsPage = function (options) {
  options = Util.extend({}, options || {});

  this._event = CatalogEvent(options.eventDetails || {});
  this._products = CatalogEvent.getWithoutSuperseded(
      CatalogEvent.productMapToList(
      this._event.getProducts()));

  EventModulePage.call(this, options);
};

AllProductsPage.prototype = Object.create(EventModulePage.prototype);

AllProductsPage.prototype._setContentMarkup = function () {
  var productsTable,
      productsTableBody;

  productsTable = document.createElement('table');
  productsTable.className = 'tabular product-table';
  productsTable.innerHTML = '<thead>' +
      '<th>source</th>' +
      '<th>type</th>' +
      '<th>code</th>' +
      '<th>status</th>' +
      '<th>update time</th>' +
      '<th>action</th>' +
    '</thead>';

  productsTableBody = document.createElement('tbody');
  productsTable.appendChild(productsTableBody);

  for (var i = 0; i < this._products.length; i++) {
    productsTableBody.appendChild(this._getProductMarkup(this._products[i]));
  }

  // list products
  this._content.appendChild(productsTable);
  console.log(this._products);
};

/**
 * Returns a table row for the product passed in with the
 * ProductActionsView attached.
 *
 * @param  product {Object}
 *         A Product object.
 *
 * @return {Object} an <tr> element with product information
 */
AllProductsPage.prototype._getProductMarkup = function (product) {
  var actionView,
      actionsTableCell,
      tr;

  tr = document.createElement('tr');

  if (product.status === 'DELETE') {
    tr.className = 'delete';
  }

  tr.innerHTML =
      '<td>' + product.source + '</td>' +
      '<td>' + product.type + '</td>' +
      '<td>' + product.code + '</td>' +
      '<td>' + product.status + '</td>' +
      '<td>' + product.updateTime + '</td>' +
      '<td class="action"></td>';

  actionView = ProductActionsView({
    event: this._event,
    editView: this._getEditView(product),
    products: [product],
    page: null,
    viewHistory: false
  });

  // append actions to td.actions
  actionsTableCell = tr.querySelector('.action');
  actionsTableCell.appendChild(actionView.el);

  return tr;
};

/**
 * Returns a edit view that matches the type of the product
 * that is passed in. If no type is matched the default view
 * used is the Edit Product View.
 *
 * @param  product {Object}
 *         A Product object.
 *
 * @return {Object} the view to format the edit action
 */
AllProductsPage.prototype._getEditView = function (product) {
  var type = product.type,
      map = {};

  map = {
    'link' : {
      factory: EditLinkView,
      types: [
        'general-link',
        'impact-link',
        'scitech-link',
      ]
    },
    'text' : {
      factory: TextProductView,
      types: [
        'general-text',
        'impact-text',
        'scitech-text',
      ]
    }
  };

  // look for product type
  for (var key in map) {
    if (map[key].types.indexOf(type) !== -1) {
      return map[key].factory;
    }
  }

  // fall back to EditProductView
  return EditProductView;
};


module.exports = AllProductsPage;