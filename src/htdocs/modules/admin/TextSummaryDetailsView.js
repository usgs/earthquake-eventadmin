'use strict';

var EventModulePage = require('./AdminEventModulePage');


/**
 * A summary/details view like object for Text based products, which are
 * not normally SummaryDetails type pages.
 */
var TextSummaryDetailsView = function (/*options*/) {
  var _this;

  _this = {};


  /**
   * Accessor for inline content.
   *
   * Intended for subclassing, in case a product stores
   * its content somewhere else (like tectonic-summary).
   *
   * @param product {Object}
   *        text product.
   */
  _this.getTextContent = function (product) {
    try {
      return product.contents[''].bytes;
    } catch (e) {
      return '';
    }
  };

  /**
   * Build summary markup for a text product.
   *
   * @param product {Object}
   *        text product with inline content.
   */
  _this.buildSummaryMarkup = function (product) {
    var el = document.createElement('div');
    el.classList.add('summary');
    el.classList.add('text-summary');
    el.innerHTML = new Date(product.updateTime).toISOString()
        .replace('T', ' ')
        .replace(/[\d\.+]Z/, ' UTC');

    return el;
  };

  /**
   * Build detail markup for a text product.
   *
   * @param product {Object}
   *        text product with inline content.
   */
  _this.getDetailsContent = function (product) {
    var html,
        el;
    html = _this.getTextContent(product);
    html = EventModulePage.prototype._replaceRelativePaths.call(
        null, html, product.contents);
    el = document.createElement('div');
    el.classList.add('text-detail');
    el.innerHTML = html;
    return el;
  };


  return _this;
};


module.exports = TextSummaryDetailsView;
