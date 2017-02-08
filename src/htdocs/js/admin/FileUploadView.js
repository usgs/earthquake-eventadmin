'use strict';

var View = require('mvc/View'),
    Util = require('util/Util'),

    FileUploadStatusView = require('admin/FileUploadStatusView');


var DEFAULTS = {
  url: 'file_upload.php',
  hideOnSuccess: false
};


/**
 * A view for uploading files, provides a drop target and file input element.
 *
 * Depends on File, FileList, FormData, and XMLHttpRequest2.
 *
 * Posts files to options.url using the form field name "file".
 * Includes file last modified using the form field "lastModified".
 * Expects a JSON formatted response when successful.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.url {String}
 *        url where uploads should be sent.
 *        default 'file_upload.php'.
 * @trigger 'upload'
 *          when file is successfully uploaded.
 *          data for event is JSON response.
 * @trigger 'uploaderror'
 *          when response code is not 200.
 *          data for event is XHR object.
 * @see mvc/View
 */
var FileUploadView = function (options) {
  var _this,
      _initialize,
      // variables
      _buttonEl,
      _dropEl,
      _inputEl,
      _uploadEl,
      _url,
      _hideOnSuccess,
      // methods
      _onButtonClick,
      _onFile,
      _onDragLeave,
      _onDragOver,
      _onDrop;


  _this = View(options);

  _initialize = function (options) {
    options = Util.extend({}, DEFAULTS, options);

    _url = options.url;
    _hideOnSuccess = options.hideOnSuccess;

    _dropEl = _this.el;
    _dropEl.addEventListener('dragleave', _onDragLeave);
    _dropEl.addEventListener('dragover', _onDragOver);
    _dropEl.addEventListener('drop', _onDrop);

    _buttonEl = options.button || document.createElement('button');
    _buttonEl.addEventListener('click', _onButtonClick);

    _uploadEl = options.upload || document.createElement('div');

    _inputEl = document.createElement('input');
    _inputEl.setAttribute('type', 'file');
    _inputEl.addEventListener('change', _onDrop);
  };


  /**
   * Called when the button is clicked. Serves as a simple proxy for the
   * input button but is more manageable for visual display.
   *
   */
  _onButtonClick = function () {
    var evt;

    if (_inputEl.click) {
      _inputEl.click();
    } else {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent('click', true, true);
      _inputEl.dispatchEvent(evt);
    }
  };

  /**
   * Called when drag leaves drop target, and by _onDrop.
   *
   * @param e {DOMEvent}
   *        drag/drop event.
   */
  _onDragLeave = function (e) {
    e.preventDefault();
    _dropEl.classList.remove('drag-over');
  };

  /**
   * Called when drag enters drop target.
   *
   * @param e {DOMEvent}
   *        drag event.
   */
  _onDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    _dropEl.classList.add('drag-over');
  };

  /**
   * Called when drop, or file input change, occurs.
   *
   * @param e {DOMEvent}
   *        drop/change event
   */
  _onDrop = function (e) {
    var files,
        i;

    _onDragLeave(e);

    files = e.target.files || e.dataTransfer.files;
    for (i = 0; i < files.length; i++) {
      _onFile(files[i]);
    }

    // clear input in case that was source of event
    _inputEl.value = '';
  };

  /**
   * Called with each file either dropped on drop target,
   * or chosen with file input.  Uploads file.
   *
   * @param f {File}
   *        selected file.
   */
  _onFile = function (f) {
    var data,
        statusView,
        xhr;

    data = new FormData();
    data.append('file', f);
    data.append('lastModified', f.lastModified);

    xhr = new XMLHttpRequest();
    xhr.open('POST', _url);

    statusView = FileUploadStatusView({
      el: _uploadEl.appendChild(document.createElement('div')),
      file: f,
      xhr: xhr
    });

    xhr.addEventListener('load', function () {
      if (xhr.status === 200) {
        if (_hideOnSuccess) {
          statusView.destroy();
        }
        _this.trigger('upload', JSON.parse(xhr.response));
      } else {
        _this.trigger('uploaderror', xhr);
      }
      xhr = null;
    });

    xhr.send(data);
    data = null;
  };


  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    if (_this === null) {
      // already destroyed
      return;
    }

    _dropEl.removeEventListener('dragleave', _onDragLeave);
    _dropEl.removeEventListener('dragover', _onDragOver);
    _dropEl.removeEventListener('drop', _onDrop);

    _buttonEl.removeEventListener('click', _onButtonClick);

    _inputEl.removeEventListener('change', _onDrop);

    _buttonEl = null;
    _dropEl = null;
    _inputEl = null;
    _uploadEl = null;
    _url = null;
    _hideOnSuccess = null;

    _onButtonClick = null;
    _onDragLeave = null;
    _onDragOver = null;
    _onDrop = null;
    _onFile = null;

    _this = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = FileUploadView;
