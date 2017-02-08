'use strict';


var Accordion = require('accordion/Accordion'),
    ModalView = require('mvc/ModalView'),
    Product = require('admin/Product'),
    ProductSender = require('admin/ProductSender'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS,
    _EXIT_CODES;

_EXIT_CODES = {
  0: 'OKAY',
  1: 'EXIT_INVALID_ARGUMENTS',
  2: 'EXIT_UNABLE_TO_BUILD',
  3: 'EXIT_UNABLE_TO_SEND',
  4: 'EXIT_PARTIALLY_SENT'
};

_DEFAULTS = {
  modalText: 'Click a product below for more details.',
  modalTitle: 'Products to Send'
};


var _getProductIdentifier,
    _prettySize;

_prettySize = function (size) {
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


_getProductIdentifier = function (product) {
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

  /**
   * Constructor.
   * Initializes a new SendProductView.
   *
   */
  _initialize = function (options) {
    var el;

    _accordion = null;

    // options
    options = Util.extend({}, _DEFAULTS, options);
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
  };


  /**
   * Find the container for the given `product`.
   *
   * @param product {Product}
   *     The product for which to find the container.
   *
   * @return {DOMElement}
   *     The element for this product or null if no such element exists.
   */
  _getContainerForProduct = function (product) {
    var container,
        containers,
        i,
        len,
        productContainer,
        productId;

    containers = _this.el.querySelectorAll('section.accordion');
    productContainer = null;
    productId = _getProductIdentifier(product);

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

  /**
   * Callback function executed when the dialog cancel button is clicked.
   * Hides the dialog and dispatches a 'cancel' event on this view.
   *
   */
  _onCancel = function () {
    _dialog.hide();
    _this.trigger('cancel');
  };

  /**
   * Callback function executed when the user has sent a product and clicks the
   * done button indicating they are finished. Hides the dialog and dispatches
   * a 'done' event on this view.
   *
   */
  _onDone = function () {
    _dialog.hide();
    _this.trigger('done');
  };

  /**
   * Callback function executed when the user indicates they would like the
   * product to be sent. Uses the sender to send all necessary products and
   * updates the dialog to hide the send button and provide a done button.
   *
   */
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

  /**
   * Callback function executed when the product sender finishes sending a
   * product. Verifies the send status and generates a result message
   * in the dialog. If all products are done sending, updates dialog
   * title to indicate sending is complete.
   *
   * @param status {Integer}
   *     Number indicating status of send XHR request.
   * @param xhr {XMLHttpRequest}
   *     The XMLHttpRequest object used to send the product.
   * @param data {Object}
   *     The data returned by the XHR request.
   */
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
    if (_this === null) {
      return;
    }

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
        toggleText: _getProductIdentifier(product),
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

  /**
   * Hides the dialog.
   *
   */
  _this.hide = function () {
    _dialog.hide();
  };

  /**
   * Shows the dialog.
   *
   */
  _this.show = function () {
    _this.render();
    _dialog.show();
  };

  /**
   * Generates markup used for displaying information about the product(s) to
   * be sent.
   *
   * @param {Product}
   *     The product to format.
   *
   * @return {String}
   *     The markup to display for this product.
   */
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

      buf.push('<li>' + name + ' (' + _prettySize(content.get('length')) +
          ') ' + type + '</li>');
    });
    buf.push('</ul></dd>');

    buf.push('</dl>');
    return buf.join('');
  };

  /**
   * Default formatting method used to render a message about the status
   * of an individual product send status. This method may be overridden
   * if a 'formatResult' parameter is provided as an option during
   * this view's construction.
   *
   * @param status {Integer}
   *     Number indicating status of send XHR request.
   * @param xhr {XMLHttpRequest}
   *     The XMLHttpRequest object used to send the product.
   * @param data {Object}
   *     The data returned by the XHR request.
   *
   * @return {String}
   *     The markup to display as the result.
   */
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
          _EXIT_CODES[exitCode] + ' :: Failed to send product!' +
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


  _initialize(options);
  options = null;
  return _this;
};


module.exports = SendProductView;
