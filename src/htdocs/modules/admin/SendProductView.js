'use strict';

var ProductSender = require('ProductSender'),

    Accordion = require('accordion/Accordion'),

    ModalView = require('mvc/ModalView'),
    View = require('mvc/View'),

    Util = require('util/Util');


var EXIT_CODES = {
  0: 'OKAY',
  1: 'EXIT_INVALID_ARGUMENTS',
  2: 'EXIT_UNABLE_TO_BUILD',
  3: 'EXIT_UNABLE_TO_SEND',
  4: 'EXIT_PARTIALLY_SENT'
};


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
      _accordion,
      _dialog,
      _products,
      _sendCount,
      _sentCount,
      _sender,

      // methods
      _formatProduct,
      _formatResult,
      _getContainerForProduct,
      _onCancel,
      _onSend,
      _sendCallback;

  _this = View(options);

  _initialize = function () {
    var el;

    _accordion = null;

    // options
    _products = options.products || [options.product];
    _sender = options.sender || ProductSender();
    _formatProduct = options.formatProduct || null;
    _formatResult = options.formatResult || null;

    // create elements
    el = _this.el;
    el.classList.add('sendproduct');

    // show modal dialog
    _dialog = ModalView(el, {
      title: 'Send Products',
      closable: false,
      buttons: [
        {
          classes: ['sendproduct-send', 'green', 'confirm'],
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


  _getContainerForProduct = function (product) {
    var container,
        containers = _this.el.querySelectorAll('section.accordion'),
        i,
        len,
        productContainer = null;

    for (i = 0, len = containers.length; i < len; i++) {
      container = containers.item(i);
      if (container.querySelector('.accordion-toggle').innerHTML ===
          product.get('id')) {
        productContainer = container;
      }
    }

    return productContainer;
  };

  _onCancel = function () {
    _dialog.hide();
    _this.trigger('cancel');
  };

  _onSend = function () {
    var cancelButton,
        sendButton;

    _sendCount = 0;
    _sentCount = 0;

    _this.trigger('beforesend');
    _dialog.el.querySelector('.sendproduct-send')
        .setAttribute('disabled', 'disabled');

    _products.forEach(function (product) {
      _sender.sendProduct(product, _sendCallback);
      _sendCount += 1;
    });

    _this.el.querySelector('h4').innerHTML = 'Send Status';

    // hide send button
    sendButton = _dialog.el.querySelector('.sendproduct-send');
    sendButton.style.display = 'none';
    // update cancel button
    cancelButton = _dialog.el.querySelector('.sendproduct-cancel');
    cancelButton.innerHTML = 'Done';
    cancelButton.classList.add('green');
    cancelButton.setAttribute('disabled', 'disabled');
  };

  _sendCallback = function (status, xhr, data) {
    var container,
        format,
        formatted,
        product;

    _sentCount += 1;
    product = data.product;
    container = _getContainerForProduct(product);

    container.querySelector('.accordion-toggle').classList.add('send-complete');
    container = container.querySelector('.accordion-content');

    if (typeof _formatResult === 'function') {
      format = _formatResult;
    } else {
      format = _this.formatResult;
    }

    formatted = format(status, xhr, data);
    if (typeof formatted === 'string') {
      container.innerHTML = formatted;
    } else {
      container.innerHTML = '';
      container.appendChild(formatted);
    }

    // trigger event
    _this.trigger(status === 200 ? 'success' : 'error', data);

    if (_sentCount === _sendCount) {
      _dialog.el.querySelector('.sendproduct-cancel')
          .removeAttribute('disabled');
      _this.el.querySelector('h4').innerHTML = 'All Products Sent';
    }
  };

  /**
   * Clean up event handlers and references.
   */
  _this.destroy = Util.compose(function () {
    // remove event listeners
    _dialog.hide();
    _dialog.destroy();

    if (_accordion && _accordion.destroy) {
      _accordion.destroy();
    }
    _accordion = null;

    // free references
    _dialog = null;
    _products = null;
    _sendCount = null;
    _sentCount = null;
    _sender = null;
    _formatProduct = null;
    _getContainerForProduct = null;
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
    var accordionContent,
        format;

    if (typeof _formatProduct === 'function') {
      format = _formatProduct;
    } else {
      format = _this.formatProduct;
    }

    accordionContent = _products.map(function (product) {
      return {
        toggleText: product.get('id'),
        toggleElement: 'h5',
        classes: 'accordion-standard accordion-closed',
        contentText: format(product)
      };
    });

    if (_accordion !== null && _accordion.destroy) {
      _accordion.destroy();
    }
    _this.el.innerHTML = '<h4>Products to Send</h4>';

    _accordion = Accordion({
      el: _this.el,
      accordions: accordionContent
    });
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

    buf.push('<dl>');

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
    var exitCode,
        result;

    if (status !== 200) {
      result = '<div class="alert error">' +
        data.error +
      '</div>';
    } else {
      exitCode = data.exitCode;

      if (data.exitCode !== 0) {
        result = '<div class="alert error">' +
          EXIT_CODES[data.exitCode] + ' :: Failed to send product!' +
        '</div>';
      } else {
        result = '<div class="alert info">' +
          'Product Successfully Sent' +
        '</div>';
      }

      result += JSON.stringify(data, null, 2);
    }

    return result;
  };


  _initialize();
  return _this;
};


module.exports = SendProductView;
