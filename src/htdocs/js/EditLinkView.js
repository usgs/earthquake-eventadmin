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

      _data,
      _form,
      _text,
      _url,

      _createLinkForm;

  _this = View(options);


  _initialize = function (options) {
    _data = extend({}, DATA_DEFAULTS, options.data);
    _createLinkForm();
  };

  _createLinkForm = function () {
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

    el.querySelector('form').addEventListener('save', function () {
      _onSubmit();
    });

    el.querySelector('form').addEventListener('cancel', function () {
      _cancel();
    });
  };

  _onSubmit = function (options) {
    options.data.text = _text;
    options.data.url = _url;
  };

  _cancel = function () {
    window.history.go(-1);
  };

  _initialize();
  return _this;

};

module.exports = EventAdminView;
