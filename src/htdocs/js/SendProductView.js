'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),

    ProductSender = require('./ProductSender');


/**
 * View that displays product to be sent.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.product {Product}
 *        product to send.
 * @param options.formatProduct {Function(Product)}
 *        optional, override default formatting of product information.
 *        returns html as string, or DOM element.
 * @param options.sender {ProductSender}
 *        optional, default ProductSender().
 * @see mvc/View
 *
 * @triggers 'beforesend' when send starts.
 * @triggers 'cancel' when cancelled.
 * @triggers 'error' when send fails.
 * @triggers 'success' when send completes successfully.
 */
var SendProductView = function (options) {
  var _this,
      _initialize,
      // variables
      _cancelButton,
      _infoEl,
      _product,
      _resultEl,
      _sendButton,
      _sender,
      // methods
      _formatProduct,
      _onCancel,
      _onSend,
      _sendCallback;

  _this = View(options);

  _initialize = function () {
    var el;
    // options
    _product = options.product;
    _sender = options.sender || ProductSender();
    _formatProduct = options.formatProduct || _formatProduct;
    // create elements
    el = _this.el;
    el.innerHTML =
        '<div class="sendproduct">' +
          '<div class="product"></div>' +
          '<div class="actions">' +
            '<button class="send">Send</button>' +
            '<button class="cancel">Cancel</button>' +
          '</div>' +
          '<div class="result"></div>' +
        '</div>';
    _infoEl = el.querySelector('.product');
    _sendButton = el.querySelector('.send');
    _cancelButton = el.querySelector('.cancel');
    _resultEl = el.querySelector('.result');
    // add event listeners
    _sendButton.addEventListener('click', _onSend);
    _cancelButton.addEventListener('click', _onCancel);
    _product.on('change', _this.render);
    // initial render
    _this.render();
    options = null;
  };

  _formatProduct = function (product) {
    var buf = [],
        props,
        p;
    buf.push('<dl class="vertical">' +
        '<dt>Source</dt><dd>' + product.get('source') + '</dd>' +
        '<dt>Type</dt><dd>' + product.get('type') + '</dd>' +
        '<dt>Code</dt><dd>' + product.get('code') + '</dd>' +
        '<dt>Properties</dt><dd><dl class="horizontal">');

    props = product.get('properties');
    for (p in props) {
      buf.push('<dt>' + p + '</dt><dd>' + props[p] + '</dd>');
    }
    buf.push('</dl></dd>' +
        '</dl>');
    return buf.join('');
  };

  _onCancel = function () {
    _this.trigger('cancel');
  };

  _onSend = function () {
    _this.trigger('beforesend');
    _sender.sendProduct(_product, _sendCallback);
  };

  _sendCallback = function (status, xhr, data) {
    // display results
    data = data || xhr.responseText;
    _resultEl.innerHTML =
        '<div class="alert ' +
            (status === 200 ? 'info' : 'error') + '">' +
          '<h2>' + status + '</h2>' +
          '<pre>' +
            (typeof data === 'object' ?
                JSON.stringify(data, null, 2) :
                data) +
          '</pre>' +
        '</div>';
    // trigger event
    if (status === 200) {
      _this.trigger('success');
    } else {
      _this.trigger('error');
    }
  };


  /**
   * Clean up event handlers and references.
   */
  _this.destroy = Util.compose(function () {
    // remove event listeners
    _sendButton.removeEventListener('click', _onSend);
    _cancelButton.removeEventListener('click', _onCancel);
    _product.off('change', _this.render);
    // free references
    _cancelButton = null;
    _infoEl = null;
    _product = null;
    _resultEl = null;
    _sendButton = null;
    _sender = null;
    _formatProduct = null;
    _onCancel = null;
    _onSend = null;
    _sendCallback = null;
    _initialize = null;
    _this = null;
  }, _this.destroy);

  /**
   * Display the list of products to send.
   */
  _this.render = function () {
    var formatted = _formatProduct(_product);
    if (typeof formatted === 'string') {
      _infoEl.innerHTML = formatted;
    } else {
      _infoEl.innerHTML = '';
      _infoEl.appendChild(formatted);
    }
  };


  _initialize();
  return _this;
};


module.exports = SendProductView;
