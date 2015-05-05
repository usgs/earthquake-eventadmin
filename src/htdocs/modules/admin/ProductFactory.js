'use strict';

var Product = require('Product');


/**
 * A factory for product objects.
 */
var ProductFactory = function (/*options*/) {
  var _this,
      // methods
      _getProduct;

  _this = {};


  /**
   * Get a product object.
   */
  _getProduct = function (product) {
    if (typeof product.get === 'function') {
      return product;
    } else {
      return Product(product);
    }
  };


  /**
   * Create a delete product for an existing product.
   *
   * @param product {Product}
   *        product to delete.
   * @return {Product}
   *         delete product.
   */
  _this.getDelete = function (product) {
    var code,
        properties,
        source,
        type;

    product = _getProduct(product);
    code = product.get('code');
    properties = product.get('properties');
    source = product.get('source');
    type = product.get('type');

    return Product({
      source: source,
      type: type,
      status: Product.STATUS_DELETE,
      code: code,
      properties: {
        eventsource: properties.eventsource,
        eventsourcecode: properties.eventsourcecode
      }
    });
  };

  /**
   * Create a trump product for an existing product.
   *
   * @param product {Product}
   *        product to trump.
   * @return {Product}
   *         trump product.
   */
  _this.getTrump = function (product) {
    var code,
        properties,
        source,
        type;

    product = _getProduct(product);
    code = product.get('code');
    properties = product.get('properties');
    source = product.get('source');
    type = product.get('type');

    return Product({
      source: source,
      type: 'trump-' + type,
      status: Product.STATUS_UPDATE,
      code: code,
      properties: {
        'eventsource': properties.eventsource,
        'eventsourcecode': properties.eventsourcecode,
        'trump-source': source,
        'trump-code': code
      }
    });
  };


  return _this;
};


module.exports = ProductFactory;
