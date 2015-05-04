'use strict';

var ModalView = require('mvc/ModalView'),
    Product = require('Product'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    SendProductView = require('admin/SendProductView.js');

/**
 * Modal view that allows the user to either add or edit links.
 * @param options {Object}
 *        all options are passed to EditLinkView.
 */
var EditLinkView = function (options) {
  var _this,
      _initialize,

      _modal,
      _product,
      _sendProductView,
      _text,
      _url,

      _onCancel,
      _onDone,
      _onSubmit;

  _this = View(options);


  /**
   * Creates modal dialog box
   * @param options {Object}
   *        all options are passed to modal
   */
  _initialize = function (options) {
    var properties,
        title;

    _product = options.product;

    if (!_product) {
      if (!options.type || !options.source || !options.code ||
          !options.eventSource || !options.eventSourceCode) {
        throw new Error('Must receive either a product or type/source/code ' +
            'and eventSource/eventSourceCode properties.');
      }

      _product = Product({
        type: options.type,
        source: options.source,
        code: options.code,
        properties: {
          eventsource: options.eventSource,
          eventsourcecode: options.eventSourceCode,
          'review-status': 'Reviewed',
        }
      });
    }

    _sendProductView = SendProductView({
      product: _product
    });

    _sendProductView.on('done', _onDone);

    _this.el.innerHTML =
        '<div class="addEditLink">' +
          '<label for="linkText">Link Text: </label>' +
          '<br/>' +
          '<input id="linkText" name="linkText" type="text"/>' +
          '<br/>' +
          '<label for="linkURL">Link URL: </label>' +
          '<br/>' +
          '<input id="linkURL" name="linkURL" type="text"/>' +
        '</div>';

    _text = _this.el.querySelector('#linkText');
    _url = _this.el.querySelector('#linkURL');

    properties = _product.get('properties');

    _modal = ModalView(_this.el, {
      title: title,
      closable: false,
      buttons: [
        {
          classes: ['save', 'green' ],
          text:'Send',
          callback: _onSubmit
        },
        {
          classes: ['cancel'],
          text: 'Cancel',
          callback: _onCancel
        }
      ]
    });
  };

  /**
   * On modal view submit sends properties and calls sendProductView.
   */
  _onSubmit = function () {
    var props;

    props = Util.extend({}, _product.get('properties'));
    props.text = _text.value;
    props.url = _url.value;

    _product.set({
      properties: props
    });

    _sendProductView.show();
  };

  /**
   * Hides the modal view and calls destroy
   */
  _onCancel = function () {
    _modal.hide();
    _this.trigger('cancel');
    _this.destroy();
  };

  /**
   * Hides the modal view and calls destroy.
   */
  _onDone = function () {
    _modal.hide();
    _this.trigger('done');
    _this.destroy();
  };

  /**
   * Gets Text and url values if they exists.
   */
  _this.render = function () {
    var props,
        text,
        url;

    props = _product.get('properties');
    text = props.text || '';
    url = props.url || '';

    _text.value = text;
    _url.value = url;
  };

  /**
   * Hides the modal dialog box.
   */
  _this.hide = function () {
    _modal.hide();
  };

  /**
   * Shows modal dialog box.
   */
  _this.show = function () {
    _this.render();
    _modal.show();
  };

  /**
   * Cleans up everyting.
   */
  _this.destroy = Util.compose(function () {
    _modal.hide();
    _modal.destroy();
    _modal = null;
    _sendProductView.destroy();
    _sendProductView = null;
    _text = null;
    _url = null;
    _onSubmit = null;
    _onCancel = null;
    _this = null;
  }, _this.destroy);

  _initialize(options);
  options = null;
  return _this;

};

module.exports = EditLinkView;
