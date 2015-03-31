'use strict';

var ModalView = require('mvc/ModalView');
    Util = require('util/Util'),
    View = require('mvc/View'),

    ProductSender = require('ProductSender');


var DATA_DEFAULTS = {
  id: null,
  text: null,
  type: null,
  url: null
};

var EditLinkView = function (options) {
  var _this,
      _initialize,

      _cancel,
      _data,
      _form,
      _modal,
      _sender,
      _text,
      _url,

      _onSubmit,
      _onCancel;

  _this = View(options);

  _initialize = function (options) {
    _data = Util.extend({}, DATA_DEFAULTS, options.data);
    _sender = options.sender || ProductSender();

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

      _modal = ModalView(content, {
        title: 'Add/Edit Link',
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

    _text = _this.el.querySelector('#linkText');
    _url = _this.el.querySelector('#linkURL');
    _cancel = _this.el.querySelector('.cancel');

    _form.addEventListener('submit', _onSubmit);
    _cancel.addEventListener('click', _onCancel);

    options = null;
  };

  _onSubmit = function () {
    _data.text = _text;
    _data.url = _url;
    _modal.el.querySelector('.save').disabled = true;

    //_this.trigger('save', _data);
    _sender.sendProduct('save', _data);
  };

  _onCancel = function () {
    _dialog.hide();
    _this.trigger('cancel');
  };

  _this.destroy = Util.compose(function () {
    _modal.hide();
    _modal.destroy();
    _cancel = null;
    _data = null;
    _form = null;
    _modal = null;
    _sender = null;
    _text = null;
    _url = null;
    _onSubmit = null;
    _onCancel = null;
  }, _this.destroy);

  _initialize();
  return _this;

};

module.exports = EditLinkView;
