'use strict';

var Product = require('admin/Product'),
    ProductSender = require('admin/ProductSender'),

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

var DEFAULTS = {
  modalText: 'Click a product below for more details.',
  modalTitle: 'Products to Send'
};

var prettySize = function (size) {
  var suffixes = ['B', 'KB', 'MB', 'GB'],
      suffixIdx = 0;

  size = parseFloat(size);

  while (size > 1024) {
    size /= 1024;
    suffixIdx++;
  }

  suffixIdx = Math.min(suffixIdx, suffixes.length - 1);

  return size.toFixed(1) + suffixes[suffixIdx];
};


var getProductIdentifier = function (product) {
  if (!product.get) {
    product = Product(product);
  }

  return product.get('id') || [
    product.get('source'),
    product.get('type'),
    product.get('code')
  ].join(':');
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
      _modalText,
      _modalTitle,
      _products,
      _sendCount,
      _sentCount,
      _sender,

      // methods
      _formatProduct,
      _formatResult,
      _getContainerForProduct,
      _onCancel,
      _onDone,
      _onSend,
      _sendCallback;

  _this = View(options);

  _initialize = function () {
    var el;

    _accordion = null;

    // options
    options = Util.extend({}, DEFAULTS, options);
    _products = options.products || [options.product];
    _sender = options.sender || ProductSender();
    _formatProduct = options.formatProduct || null;
    _formatResult = options.formatResult || null;
    _modalText = options.modalText;
    _modalTitle = options.modalTitle;

    // create elements
    el = _this.el;
    el.classList.add('sendproduct');

    // show modal dialog
    _dialog = ModalView(el, {
      title: _modalTitle,
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
        },
        {
          classes: ['sendproduct-done', 'green', 'hidden'],
          text: 'Done',
          callback: _onDone
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
        productContainer = null,
        productId = getProductIdentifier(product);


    for (i = 0, len = containers.length; i < len; i++) {
      container = containers.item(i);
      if (container.querySelector('.accordion-toggle').innerHTML ===
          productId) {
        productContainer = container;
        break;
      }
    }

    return productContainer;
  };

  _onCancel = function () {
    _dialog.hide();
    _this.trigger('cancel');
  };

  _onDone = function () {
    _dialog.hide();
    _this.trigger('done');
  };

  _onSend = function () {
    var cancelButton,
        doneButton,
        sendButton;

    _sendCount = 0;
    _sentCount = 0;

    _dialog.el.querySelector('.modal-title').innerHTML = 'Sending&hellip;';

    // hide send button
    sendButton = _dialog.el.querySelector('.sendproduct-send');
    sendButton.classList.add('hidden');

    // hide the cancel button
    cancelButton = _dialog.el.querySelector('.sendproduct-cancel');
    cancelButton.classList.add('hidden');

    // show done button
    doneButton = _dialog.el.querySelector('.sendproduct-done');
    doneButton.classList.remove('hidden');

    _products.forEach(function (product) {
      _sender.sendProduct(product.toJSON(), _sendCallback);
      _sendCount += 1;
    });
  };

  _sendCallback = function (status, xhr, data) {
    var container,
        format,
        formatted,
        product;

    _sentCount += 1;
    product = data.product;
    container = _getContainerForProduct(product);

    if (status === 200 && (data.exitCode === 0 || data.exitCode === 4)) {
      container.querySelector('.accordion-toggle')
          .classList.add('send-complete');
    } else {
      container.querySelector('.accordion-toggle')
          .classList.add('send-error');
    }
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

    if (_sentCount === _sendCount) {
      _dialog.el.querySelector('.sendproduct-done')
          .removeAttribute('disabled');
      _dialog.el.querySelector('.modal-title').innerHTML = 'Complete';
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
    _onDone = null;
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
        format,
        isClosed;

    isClosed = (_products.length > 1) ? ' accordion-closed' : '';

    if (typeof _formatProduct === 'function') {
      format = _formatProduct;
    } else {
      format = _this.formatProduct;
    }

    accordionContent = _products.map(function (product) {
      return {
        toggleText: getProductIdentifier(product),
        toggleElement: 'h5',
        classes: 'accordion-standard' + isClosed,
        contentText: format(product)
      };
    });

    if (_accordion !== null && _accordion.destroy) {
      _accordion.destroy();
    }

    _this.el.innerHTML = '<p>' + _modalText + '</p>';

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
        name,
        r,
        l,
        contents,
        type;

    buf.push('<dl>');

    buf.push('<dt>ID</dt><dd>' +
        '<dl>' +
          '<dt>source</dt><dd>' + product.get('source') + '</dd>' +
          '<dt>type</dt><dd>' + product.get('type') + '</dd>' +
          '<dt>code</dt><dd>' + product.get('code') + '</dd>' +
          '<dt>status</dt><dd>' + product.get('status') + '</dd>' +
        '</dl>' +
        '</dd>');

    props = product.get('properties');
    buf.push('<dt>Properties</dt><dd class="horizontal"><dl>');
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

    contents = product.get('contents').data();
    buf.push('<dt>Contents</dt><dd><ul>');
    contents.forEach(function (content) {
      p = content.get('id');
      type = content.get('contentType');

      if (p === '') {
        name = '<em>inline</em>';
      } else {
        name = p;
      }

      buf.push('<li>' + name + ' (' + prettySize(content.get('length')) +
          ') ' + type + '</li>');
    });
    buf.push('</ul></dd>');

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

      if (exitCode === 0) {
        result = '<div class="alert success">' +
          'Product Successfully Sent' +
        '</div>';
      } else if (exitCode === 4) {
        result = '<div class="alert warning">' +
          'Product Partially Sent (this is usually okay).' +
        '</div>';
      } else {
        result = '<div class="alert error">' +
          EXIT_CODES[exitCode] + ' :: Failed to send product!' +
        '</div>';
      }

      if (data.output !== '') {
        result += '<h6>Output</h6><pre><code>' + data.output + '</code></pre>';
      }
      result += '<h6>Log</h6>' +
          '<pre><code>' + (data.error || 'No log output') + '</code></pre>';
      result += '<h6>Command</h6>' +
          '<pre><code>' +
            data.command.replace(/'--/g, '\n  \'--') +
          '</code></pre>';
    }

    return result;
  };


  _initialize();
  return _this;
};


module.exports = SendProductView;
