'use strict';


/**
 * A summary/details view like object for Text based products, which are
 * not normally SummaryDetails type pages.
 */
var LinkSummaryDetailsView = function (/*options*/) {
  var _this,
      _formatLink;

  _this = {};

  /**
   * Format a link for product history view.
   *
   * @param product {Object}
   *        link product.
   * @return {String}
   *         formatted link.
   */
  _formatLink = function (product) {
    var props = product.properties;

    return '<dl class="vertical">' +
        '<dt>Text</dt><dd>' + props.text + '</dd>' +
        '<dt>URL</dt><dd>' + props.url + '</dd>' +
        '</dl>';
  };

  /**
   * Build summary markup for a text product.
   *
   * @param product {Object}
   *        text product with inline content.
   */
  _this.buildSummaryMarkup = function (product) {
    var el;

    el = document.createElement('div');
    el.classList.add('summary');
    el.classList.add('link-summary');
    el.innerHTML = _formatLink(product);

    return el;
  };

  /**
   * Build detail markup for a text product.
   *
   * @param product {Object}
   *        text product with inline content.
   */
  _this.getDetailsContent = function (product) {
    var el;

    el = document.createElement('div');
    el.classList.add('link-detail');
    el.innerHTML = _formatLink(product);
    return el;
  };


  return _this;
};


module.exports = LinkSummaryDetailsView;
