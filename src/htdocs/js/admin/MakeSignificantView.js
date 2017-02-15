'use strict';

var ModalView = require('mvc/ModalView'),
    Product = require('admin/Product'),
    SendProductView = require('admin/SendProductView'),
    Util = require('util/Util'),
    View = require('mvc/View');

/**
 * Modal view that lets the user make an event significant
 * @param options {object}
 *        all options are passed to MakeSignificantView.
 */
var MakeSignificantView = function (options) {
  var _this,
      _initialize;

  _this = View(options);

  _initialize = function (options) {
    var title;

    _this.product = options.product;
    title = 'Make Event Significant';

    if(!_this.product) {
      if (!options.type || !options.source || !options.code ||
          !options.eventSource || !options.eventSourceCode) {
        throw new Error('Must receive either a product or type/source/code ' +
            'and eventSource/eventSourceCode properties.');
      }

      _this.product = Product({
        type: options.type,
        source: options.source,
        code: options.code,
        properties: {
          eventsource: options.eventSource,
          eventsourcecode: options.eventSourceCode,
          significance: options.significance
        }
      });
    }

    _this.sendProductView = SendProductView({
      product: _this.product
    });

    _this.sendProductView.on('done', _this.onCancel);

    _this.el.innerHTML =
      '<div class="make-significant">' +
        '<p>' +
          'You are about to change the significance. A value greater than or ' +
          'equal to 600 makes an event significant.' +
        '</p>' +
        '<label for="significant-value">Significant Value: </label>' +
        '<input id="significant-value" type="text" />' +
        '<div class="significant-warning"></div>' +

      '</div>';

    _this.sig = _this.el.querySelector('#significant-value');
    _this.significantWarning = _this.el.querySelector('.significant-warning');

    _this.modal = ModalView(_this.el, {
      title: title,
      closable: false,
      buttons: [
        {
          classes: ['save', 'green'],
          text: 'Send',
          callback: _this.onSubmit
        },
        {
          classes: ['cancel'],
          text: 'Cancel',
          callback: _this.onCancel
        }
      ]
    });
  };

  /**
   * Hides modal view and calls destroy.
   */
  _this.onCancel = function () {
    _this.modal.hide();
    _this.trigger('cancel');
    _this.destroy();
  };

  /**
   * On modal view submit sends properties and calls SendProductView
   */
  _this.onSubmit = function () {
    var properties;

    properties = Util.extend({}, _this.product.get('properties'));
    properties.significance = _this.sig.value;

    _this.product.set({
      properties: properties
    });

    _this.sendProductView.show();
  };

  /**
   * Destroy all the things.
   */
  _this.destroy = Util.compose(function () {
    _this = null;
    _initialize = null;
  }, _this.destroy);

  /**
   * Hides the modal dialog box
   */
  _this.hide = function () {
    _this.modal.hide();
  };

  _this.render = function () {
    _this.checkSignificance();
  };

  _this.checkSignificance = function () {
    var properties,
        significance;

    properties = _this.product.get('properties');
    if (properties) {
      significance = properties.significance;
      (significance >= 600 ?
          _this.isSignificant(significance) : _this.sig.value = 600);
    }
  };

  /**
   * @param significance (Number)
   *        significance value
   */
  _this.isSignificant = function (significance) {
    _this.significantWarning.classList.add('alert', 'warning');
    _this.significantWarning.innerHTML = [
      'This event is already considered significant. Sending a value ',
      'of less than 600 will make the event insignificant.'
    ].join('');

    _this.sig.value = significance;
  };

  /**
   * Shows modal dialog box.
   */
  _this.show = function () {
    _this.render();
    _this.modal.show();
  };

  _initialize(options);
  options = null;
  return _this;
};

module.exports = MakeSignificantView;
