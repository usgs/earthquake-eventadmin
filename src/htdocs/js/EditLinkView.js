'use strict';

var ModalView = require('mvc/ModalView'),
    Util = require('util/Util'),
    View = require('mvc/View'),

    SendProductView = require('../modules/admin/SendProductView.js');

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

  _initialize = function (options) {
    var content,
        title;

    _product = options.product;
    _sendProductView = SendProductView({
      product: _product
    });

    _sendProductView.on('done', _onDone);

    content =
        '<div>' +
          '<label for="linkText">Link Text</label>' +
          '<small>Text to display on web page</small>' +
          '<input id="linkText" name="linkText" type="text"/>' +
          '<br/>' +
          '<label for="linkURL">Link URL</label>' +
          '<small>Link to display on web page</small>' +
          '<input id="linkURL" name="linkURL" type="text"/>' +
        '</div>';

    _text = _this.el.querySelector('#linkText');
    _url = _this.el.querySelector('#linkURL');

    if ((_text === '' || null) || (_url === '' || null)) {
      title = 'Add Link';
    } else {
      title = 'Edit Link';
    }

    _modal = ModalView(content, {
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

    options = null;
  };

  _onSubmit = function () {
    var props;

    props = Util.extend({}, _product.get('properties'));
    props.text = _text.value;
    props.url = _url.value;

    _product.set({
      propeerties: props
    });

    _sendProductView.show();
  };

  _onCancel = function () {
    _modal.hide();
    _this.trigger('cancel');
    _this.destroy();
  };

  _onDone = function () {
    _modal.hide();
    _this.trigger('done');
    _this.destroy();
  };

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

  _this.hide = function () {
    _modal.hide();
  };

  _this.show = function () {
    _this.render();
    _modal.show();
  };

  _this.destroy = Util.compose(function () {
    _modal.hide();
    _modal.destroy();
    _modal = null;
    _sendProductView.destroy();
    _sendProductView= null;
    _text = null;
    _url = null;
    _onSubmit = null;
    _onCancel = null;
    _this = null;
  }, _this.destroy);

  _initialize();
  return _this;

};

module.exports = EditLinkView;
