'use strict';


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
      _text,
      _url,

      _onSubmit,
      _onCancel;

  _this = View(options);


  _initialize = function (options) {
    _data = extend({}, DATA_DEFAULTS, options.data);

    _this.el.innerHTML =
      '<div>' +
        '<form class="linkForm">' +
          '<label for="linkText">Link Text</label>' +
          '<small>Text to display on web page</small>' +
          '<input id="linkText" name="linkText" type="text"/>' +
          '<br/>' +
          '<label for="linkURL">Link URL</label>' +
          '<small>Text to display on web page</small>' +
          '<input id="linkURL" name="linkURL" type="text"/>' +
          '<br/>' +
          '<button class="save">Save Link</button>' +
          '<button class="cancel">Cancel</button>' +
        '</form>' +
      '</div>';

    _form = _this.el.querySelector('.linkForm');
    _text = _this.el.querySelector('#linkText');
    _url = _this.el.querySelector('#linkURL');
    _cancel = _this.el.querySelector('.cancel');

    _form.addEventListener('submit', _onSubmit);
    _cancel.addEventListener('click', _onCancel);
  };

  _onSubmit = function (options) {
    _data.text = _text;
    _data.url = _url;

    _this.trigger('save', _data);
  };

  _onCancel = function () {
    _this.trigger('cancel');
  };

  _initialize();
  return _this;

};

module.exports = EventAdminView;
