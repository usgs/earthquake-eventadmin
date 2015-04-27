'use strict';

var Util = require('util/Util'),
    View = require('mvc/View');

/**
 * View to display file upload status.
 *
 * @param options {Object}
 *        all options are passed to View.
 * @param options.file {File}
 *        file being uploaded.
 * @param options.xhr {XMLHttpRequest}
 *        XHR doing upload.
 * @see mvc/View
 */
var FileUploadStatusView = function (options) {
  var _this,
      _initialize,
      // variables
      _button,
      _name,
      _progress,
      _result,
      _xhr,
      // methods
      _onLoad,
      _onProgress,
      _onClick;


  _this = View(options);

  _initialize = function () {
    var el,
        file;

    file = options.file;
    _xhr = options.xhr;
    options = null;

    el = _this.el;
    el.classList.add('alert');
    el.classList.add('fileUploadStatus');
    el.innerHTML =
        '<span class="name">' + file.name + '</span>' +
        '<span class="size">(' + (file.size/1000).toFixed(1) + 'K)</span>' +
        '<button class="hidden">Ok</button>' +
        '<progress value="0" max="' + file.size + '"></progress>' +
        '<span class="result hidden"></span>';

    _button = el.querySelector('button');
    _name = el.querySelector('.name');
    _progress = el.querySelector('progress');
    _result = el.querySelector('.result');

    _button.addEventListener('click', _onClick);
    _xhr.addEventListener('load', _onLoad);
    _xhr.upload.addEventListener('progress', _onProgress);
  };


  /**
   * Called when "ok" button is clicked after upload is complete or fails.
   */
  _onClick = function () {
    _this.destroy();
  };

  /**
   * Called when XHR upload is complete.
   */
  _onLoad = function () {
    var file;

    if (_xhr.status === 200) {
      file = JSON.parse(_xhr.response);
      // show success
      _this.el.classList.add('success');
      // make name a link
      _name.innerHTML = '<a href="' + file.url + '" target="_blank">' +
          file.name + '</a>';
      // show result
      _result.innerHTML = 'Complete';
      _result.classList.remove('hidden');
      // show button
      _button.classList.add('green');
      _button.classList.remove('hidden');
    } else {
      // show error
      _this.el.classList.add('error');
      // show result
      _result.innerHTML = 'Error: ' + _xhr.response +
          ' <small>(' +
            _xhr.status + ' ' + _xhr.statusText +
          ')</small>';
    }

    // hide progress bar
    _progress.classList.add('hidden');
    // show result and button
    _result.classList.remove('hidden');
    _button.classList.remove('hidden');
  };

  /**
   * Called with progress information from upload.
   *
   * @param e {DOMEvent}
   *        xhr.upload progress event.
   */
  _onProgress = function (e) {
    if (e.lengthComputable) {
      _progress.max = e.total;
      _progress.value = e.loaded;
    }
  };

  /**
   * Destroy this view.
   */
  _this.destroy = Util.compose(function () {
    if (!_this) {
      // already destroyed
      return;
    }
    // remove event listeners
    _button.removeEventListener('click', _onClick);
    _xhr.removeEventListener('load', _onLoad);
    _xhr.upload.removeEventListener('progress', _onProgress);
    // remove from dom
    Util.detach(_this.el);
    // remove variables
    _button = null;
    _name = null;
    _progress = null;
    _result = null;
    _this = null;
    _xhr = null;
  }, _this.destroy);


  _initialize();
  return _this;
};


module.exports = FileUploadStatusView;
