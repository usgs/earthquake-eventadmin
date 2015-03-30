'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),
    ModalView = require('mvc/ModalView'),

    ProductSender = require('ProductSender');


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
    _formatProduct = options.formatProduct || null;
    _formatResult = options.formatResult || null;
    // create elements
    el = _this.el;
    el.innerHTML = '<div class="sendproduct"></div>';
    _infoEl = el.querySelector('.sendproduct');

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

    options = null;
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

    formatted = (typeof _formatResult === 'function' ?
        _formatResult : _this.formatResult)(status, xhr, data);
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
    var formatted = (typeof _formatProduct === 'function' ?
        _formatProduct : _this.formatProduct)(_product);
    if (typeof formatted === 'string') {
      _infoEl.innerHTML = formatted;
    } else {
      _infoEl.innerHTML = '';
      _infoEl.appendChild(formatted);
    }
  };

  _this.hide = function () {
    _dialog.hide();
  };

  _this.show = function () {
    _this.render();
    _dialog.show();
  };

  _this.formatProduct = function (product) {
    var buf = [],
        props,
        p,
        links,
        r,
        l,
        contents,
        content;

    buf.push('<h4>Product To Send</h4>' +
        '<dl>');

    buf.push('<dt>ID</dt><dd>' +
        '<dl>' +
          '<dt>source</dt><dd>' + product.get('source') + '</dd>' +
          '<dt>type</dt><dd>' + product.get('type') + '</dd>' +
          '<dt>code</dt><dd>' + product.get('code') + '</dd>' +
        '</dl>' +
        '</dd>');

    props = product.get('properties');
    buf.push('<dt>Properties</dt><dd><dl>');
    for (p in props) {
      buf.push('<dt>' + p + '</dt><dd>' + props[p] + '</dd>');
    }
    buf.push('</dl></dd>');

    links = product.get('links');
    buf.push('<dt>Links</dt><dd><dl>');
    for (r in links) {
      buf.push('<dt>' + r + '</dt><dd><ul>');
      l = links[r];
      buf.push(l.map(function (link) {
        return '<li>' + link + '</li>';
      }).join(''));
      buf.push('</ul></dd>');
    }
    buf.push('</dl></dd>');

    contents = product.get('contents');
    buf.push('<dt>Contents</dt><dd><dl>');
    for (p in contents) {
      content = contents[p];
      buf.push('<dt>' + p + '</dt><dd>' +
          '<dl>' +
            '<dt>Type</dt><dd>' + content.type + '</dd>' +
            '<dt>Content</dt><dd>' +
              (content.bytes ? content.bytes : content.url) +
            '</dd>' +
          '</dl>' +
          '</dd>');
    }
    buf.push('</dl></dd>');

    buf.push('</dl>');
    return buf.join('');
  };

  _this.formatResult = function (status, xhr, data) {
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


  _initialize();
  return _this;
};


module.exports = SendProductView;
