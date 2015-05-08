'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    EditLinkView = require('admin/EditLinkView'),
    TextProductView = require('admin/TextProductView'),
    EditProductView = require('admin/EditProductView'),

    ProductActionsView = require('admin/ProductActionsView'),
    EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util');

var AllProductsPage = function (options) {
  var catalogEvent;
  options = Util.extend({}, options || {});

  catalogEvent = CatalogEvent(options.eventDetails || {});
  this._products = CatalogEvent.getWithoutSuperseded(
      CatalogEvent.productMapToList(catalogEvent.getProducts()));

  this._addProductButton = null;
  this._actionViews = [];

  EventModulePage.call(this, options);
};

AllProductsPage.prototype = Object.create(EventModulePage.prototype);

AllProductsPage.prototype._setContentMarkup = function () {
  var button,
      productsTable,
      productsTableBody;

  button = document.createElement('button');
  button.classList.add('add-product-button');
  button.innerHTML = 'Add Product';
  button._clickHandler = this._onAddProductClick.bind(this);
  button.addEventListener('click', button._clickHandler);
  this._addProductButton = button;
  this._content.appendChild(button);


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
};

AllProductsPage.prototype._onAddProductClick = function () {
  var props = this._event.properties;

  EditProductView({
    product: Product({
      source: 'admin',
      code: props.net + props.code + '-' + new Date().getTime(),
      properties: {
        eventsource: props.net,
        eventsourcecode: props.code
      }
    })
  }).show();
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

  this._actionViews.push(actionView);

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

/**
 * Destroy this view.
 */
AllProductsPage.prototype.destroy = function () {
  if (this._addProductButton !== null) {
    this._addProductButton.removeEventListener('click',
        this._addProductButton._clickHandler);
    this._addProductButton = null;
  }

  if (this._actionViews !== null) {
    this._actionViews.forEach(function (view) {
      view.destroy();
    });
    this._actionViews = null;
  }

  this._products = null;

  EventModulePage.prototype.destroy.call(this);
};


module.exports = AllProductsPage;
