'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),
    ModalView = require('mvc/ModalView'),

    ProductSender = require('./ProductSender');


/**
 * View that displays product to be sent.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.product {Product}
 *        product to send.
 * @param options.formatProduct {Function(product)}
 *        optional, override default formatting of product information.
 *        returns html as string, or DOM element.
 * @param options.formatResult {Function(status, xhr, data)}
 *        optional, override default formatting of ProductSender result.
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
      _dialog,
      _infoEl,
      _product,
      _sender,
      // methods
      _formatProduct,
      _formatResult,
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
    _formatResult = options.formatResult || _formatResult;
    // create elements
    el = _this.el;
    el.innerHTML = '<div class="sendproduct"></div>';
    _infoEl = el.querySelector('.sendproduct');
    // initial render
    _this.render();

    // show modal dialog
    _dialog = ModalView(el, {
      title: 'Send Product',
      closable: false,
      buttons: [
        {
          classes: ['sendproduct-send', 'green'],
          text: 'Send',
          callback: _onSend
        },
        {
          classes: ['sendproduct-cancel'],
          text: 'Cancel',
          callback: _onCancel
        }
      ]
    });
    _dialog.show();

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

  _formatResult = function (status, xhr, data) {
    data = data || xhr.responseText;
    return '<div class="alert ' +
                (status === 200 ? 'info' : 'error') + '">' +
              '<h2>' + status + '</h2>' +
              '<pre>' +
                (typeof data === 'object' ?
                    JSON.stringify(data, null, 2) :
                    data) +
              '</pre>' +
            '</div>';
  };

  _onCancel = function () {
    _dialog.hide();
    _this.trigger('cancel');
  };

  _onSend = function () {
    _this.trigger('beforesend');
    _dialog.el.querySelector('.sendproduct-send').disabled = true;
    _sender.sendProduct(_product, _sendCallback);
  };

  _sendCallback = function (status, xhr, data) {
    var cancelButton,
        sendButton,
        formatted;

    formatted = _formatResult(status, xhr, data);
    if (typeof formatted === 'string') {
      _infoEl.innerHTML = formatted;
    } else {
      _infoEl.innerHTML = '';
      _infoEl.appendChild(formatted);
    }

    // hide send button
    sendButton = _dialog.el.querySelector('.sendproduct-send');
    sendButton.style.display = 'none';
    // update cancel button
    cancelButton = _dialog.el.querySelector('.sendproduct-cancel');
    cancelButton.innerHTML = 'Done';
    cancelButton.classList.add('green');
    // trigger event
    _this.trigger(status === 200 ? 'success' : 'error');
  };


  /**
   * Clean up event handlers and references.
   */
  _this.destroy = Util.compose(function () {
    // remove event listeners
    _dialog.hide();
    _dialog.destroy();
    // free references
    _dialog = null;
    _infoEl = null;
    _product = null;
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
