'use strict';


var CatalogEvent = require('admin/CatalogEvent'),
    EditLinkView = require('admin/EditLinkView'),
    EditProductView = require('admin/EditProductView'),
    Product = require('admin/Product'),
    ProductActionsView = require('admin/ProductActionsView'),
    TextProductView = require('admin/TextProductView'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS;

_DEFAULTS = {
};

var AllProductsView = function (options) {
  var _this,
      _initialize,

      _createViewSkeleton,
      _onAddProductClick;


  _this = View(options);

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _this._actionViews = [];
    _this._eventDetails = options.eventDetails;

    _this.event = CatalogEvent(options.eventDetails || {});
    _this.products = CatalogEvent.getWithoutSuperseded(
          CatalogEvent.productMapToList(_this.event.getProducts()));

    _createViewSkeleton();
  };

  _createViewSkeleton = function () {
    /* eslint-disable indent */
    _this.el.innerHTML = [
      '<h2>Event Admin - All Products</h2>',
      '<button class="add-product-button">Add Product</button>',
      '<table class="product-table">',
        '<thead>',
          '<th scope="col">source</th>',
          '<th scope="col">type</th>',
          '<th scope="col">code</th>',
          '<th scope="col">status</th>',
          '<th scope="col">update time</th>',
          '<th scope="col">action</th>',
        '</thead>',
        '<tbody></tbody>',
      '</table>'
    ].join('');
    /* eslint-enable indent */

    _this._addProductButton = _this.el.querySelector('button');
    _this._productsTableBody = _this.el.querySelector('tbody');

    _this._addProductButton.addEventListener('click', _onAddProductClick);

    _this.products.forEach(function (product) {
      _this._productsTableBody.appendChild(_this._getProductMarkup(product));
    });
  };

  _onAddProductClick = function (evt) {
    return _this._onAddProductClick(evt);
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
  _this._getEditView = function (product) {
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
          'deleted-text',
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
   * Returns a table row for the product passed in with the
   * ProductActionsView attached.
   *
   * @param  product {Object}
   *         A Product object.
   *
   * @return {Object} an <tr> element with product information
   */
  _this._getProductMarkup = function (product) {
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
      event: _this._event,
      editView: _this._getEditView(product),
      products: [product],
      page: null,
      viewHistory: false
    });

    _this._actionViews.push(actionView);

    // append actions to td.actions
    actionsTableCell = tr.querySelector('.action');
    actionsTableCell.appendChild(actionView.el);

    return tr;
  };

  _this._onAddProductClick = function (/*evt*/) {
    var props = _this._eventDetails.properties;

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


  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return;
    }

    _this._actionsViews.forEach(function (view) {
      view.destroy();
    });

    _this._addProductButton.removeEventListener('click', _onAddProductClick);

    _initialize = null;
    _createViewSkeleton = null;
    _this = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AllProductsView;
