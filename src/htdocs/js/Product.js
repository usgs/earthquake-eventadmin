'use strict';

var ProductContent = require('ProductContent'),

    Model = require('mvc/Model'),
    Util = require('util/Util');


var STATUS_UPDATE = 'UPDATE',
    STATUS_DELETE = 'DELETE';


/**
 * A product object.
 *
 * Typically created from an event detail feed.
 * Created manually for new products.
 *
 * @param options {Object}
 *        a product object from an event detail feed.
 * @param options.source {String}
 *        product source.
 * @param options.type {String}
 *        product type.
 * @param options.code {String}
 *        product code.
 * @param options.updateTime {Number}
 *        product update time.
 * @param options.status {String}
 *        product status.
 *        default Product.STATUS_UPDATE,
 *        use Product.STATUS_DELETE for deletes.
 * @param options.properties {Object}
 *        keys are property names.
 *        values must be strings.
 * @param options.links {Object}
 *        keys are link relation names.
 *        values are arrays of uri Strings for relation.
 * @param options.contents {Object}.
 *        keys are content paths.
 *        values are content objects with keys:
 *          contentType: {String} mime type
 *          lastModified: {Number} millisecond epoch update time.
 *          length: {Number} content length, optional for new content.
 *          url: {String} url for content that lives on a server.
 *          bytes: {String} inline content (or edited).
 *        Every content should have one of "url" or "bytes".
 * @param options.preferredWeight {Number}
 *        optional, current preferred weight of product.
 */
var Product = function (options) {
  var _this,
      _initialize;

  _this = Model(Util.extend({
    id: null,
    source: null,
    type: null,
    code: null,
    updateTime: null,
    status: STATUS_UPDATE,
    properties: {},
    links: {},
    contents: {},
    preferredWeight: null
  }, options));

  _initialize = function (/*options*/) {
    var content,
        contents = _this.get('contents'),
        key;

    contents = Util.extend({}, contents);
    for (key in contents) {
      content = contents[key];
      if (!content.get) {
        contents[key] = ProductContent(content);
      }
    }
    _this.set({'contents': contents});
  };

  _initialize(options);
  options = null;
  return _this;
};


Product.STATUS_UPDATE = STATUS_UPDATE;
Product.STATUS_DELETE = STATUS_DELETE;


module.exports = Product;
