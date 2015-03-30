'use strict';

var View = require('mvc/View'),
    ModalView = require('mvc/ModalView');

var AssociateEventView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _infoEl,
      _associateEvent,
      _referenceEvent,

      // methods
      _getContent,
      _onCancel,
      _onConfirm;

  _this = View(options);

  _initialize = function () {
    var el = _this.el;

    _referenceEvent = options.referenceEvent;
    _associateEvent = options.associateEvent;

    el.innerHTML = '<div class="associate-event"></div>';
    _infoEl = el.querySelector('.associate-event');

    // show modal dialog
    _dialog = ModalView(el, {
      title: 'Associate Event',
      closable: false,
      message: _getContent(),
      buttons: [
        {
          classes: ['confirm', 'green'],
          text: 'Associate',
          callback: _onConfirm
        },
        {
          classes: ['cancel', 'red'],
          text: 'Cancel',
          callback: _onCancel
        }
      ]
    });

    _dialog.show();

    options = null;
  };

  _onConfirm = function () {
    _dialog.hide();
  };

  _onCancel = function () {
    _dialog.hide();
  };

  _getContent = function () {
    _infoEl.innerHTML =
      '<h4>Event</h4><pre><code>' + JSON.stringify(_referenceEvent, null, '  ') + '</code></pre>' +
      '<h4>Event to Associate</h4><pre><code>' + JSON.stringify(_associateEvent, null, '  ') + '</code></pre>';
  };

  _initialize();
  return _this;
};

module.exports = AssociateEventView;
