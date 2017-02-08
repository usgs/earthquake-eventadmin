'use strict';

var FileUploadView = require('FileUploadView'),
    Formatter = require('Formatter'),
    ProductContent = require('ProductContent'),

    ModalView = require('mvc/ModalView'),
    View = require('mvc/View'),

    Util = require('util/Util')
    ;


var ProductContentEditView = function (params) {
  var _this,
      _initialize,

      _dialog,
      _fileUploadView,
      _formatter,
      _idEl,
      _lengthEl,
      _modifiedEl,
      _transientContent,
      _typeEl,
      _urlEl,

      _createViewSkeleton,
      _onCancel,
      _onFileUpload,
      _onInputChange,
      _onSave;


  _this = View(params);

  _initialize = function (params) {
    var dialogTitle;

    // Create a "working" product content the user can mess with, but if the
    // user chooses to "canel" out of this view, the original product content
    // is not modified
    _transientContent = ProductContent(_this.model.get());
    _transientContent.on('change', 'render', _this);

    _formatter = params.formatter || Formatter({round: 1});

    if (_this.model.get('bytes') || _this.model.get('url')) {
      dialogTitle = 'Edit Product Content';
    } else {
      dialogTitle = 'Create Product Content';
    }

    _dialog = ModalView(_this.el, {
      buttons: [
        {
          callback: _onSave,
          classes: ['productcontentedit-create', 'green', 'confirm'],
          text: 'Save'
        },
        {
          callback: _onCancel,
          classes: ['productcontentedit-cancel'],
          text: 'Cancel'
        }
      ],
      closable: false,
      title: dialogTitle
    });

    _createViewSkeleton();
    _this.render();
  };


  _createViewSkeleton = function () {
    _this.el.classList.add('vertical');
    _this.el.classList.add('productcontentedit');

    /* eslint-disable */
    _this.el.innerHTML = [
      '<label for="content-id">',
        'Content Path',
        '<span class="help">',
          'Must be unique within a product',
        '</span>',
      '</label>',
      '<input type="text" id="content-id" data-attribute="id" ',
          'class="content-id"/>',

      '<label for="content-type">',
        'Content Type',
        '<span class="help">',
          'Mime type for the content. If unknown, text/plain is usually safe.',
        '</span>',
      '</label>',
      '<input type="text" id="content-type" data-attribute="contentType" ',
          'class="content-type"/>',

      '<label id="label-content-length">Content Length</label>',
      '<span class="content-length" ',
          'aria-labeled-by="label-content-length"></span>',

      '<label id="label-content-modified">Last Modified</label>',
      '<span class="content-modified" ',
          'aria-labeled-by="label-content-modifeid"></span>',

      '<h4>Current File</h4>',
      '<a class="content-url" target="_blank"></a>',

      '<h4>Replace File</h4>',
      '<div class="content-upload-container">',
        '<button class="confirm content-upload-button">Upload File</button>',
        '<br/>',
        'Or drag/drop a file here',
      '</div>',
      '<div class="content-upload-errors"></div>'
    ].join('');
    /* eslint-enable */

    _idEl = _this.el.querySelector('.content-id');
    _typeEl = _this.el.querySelector('.content-type');
    _lengthEl = _this.el.querySelector('.content-length');
    _modifiedEl = _this.el.querySelector('.content-modified');
    _urlEl = _this.el.querySelector('.content-url');

    _fileUploadView = FileUploadView({
      el: _this.el.querySelector('.content-upload-container'),
      button: _this.el.querySelector('.content-upload-button'),
      upload: _this.el.querySelector('.content-upload-errors')
    });
    _fileUploadView.on('upload', _onFileUpload);


    _idEl.addEventListener('change', _onInputChange);
    _typeEl.addEventListener('change', _onInputChange);
  };

  _onCancel = function () {
    _this.hide();
  };

  _onFileUpload = function (file) {
    var props;

    props = {
      contentType: file.contentType,
      lastModified: file.lastModified,
      length: file.length,
      url: file.url
    };

    if (_transientContent.get('id') === null) {
      props.id = file.name;
    }

    _transientContent.set(props);
  };

  _onInputChange = function (evt) {
    var attribute,
        props,
        target;

    target = evt.target;
    attribute = target.getAttribute('data-attribute');
    props = {};

    props[attribute] = target.value || '';

    if (attribute === 'bytes') {
      props.length = target.value.length;
      props.lastModified = (new Date()).getTime();
    }

    _transientContent.set(props);
  };

  _onSave = function () {
    try {
      // This will throw an exception if the content is not valid
      _transientContent.validate();

      // Copy all the transient content attributes into the actual model
      _this.model.set(_transientContent.get());

      _this.trigger('complete', _this.model);
      _this.hide();
    } catch (e) {
      ModalView(e.message, {
        title: 'Error Saving Content',
        classes: ['modal-error']
      }).show();
    }
  };


  _this.destroy = Util.compose(_this.destroy, function () {
    _transientContent.off();
    _fileUploadView.off();

    _idEl.removeEventListener('change', _onInputChange);
    _typeEl.removeEventListener('change', _onInputChange);

    _dialog.destroy();
    _fileUploadView.destroy();
    _transientContent.destroy();

    _createViewSkeleton = null;
    _onCancel = null;
    _onFileUpload = null;
    _onInputChange = null;
    _onSave = null;

    _dialog = null;
    _fileUploadView = null;
    _formatter = null;
    _idEl = null;
    _lengthEl = null;
    _modifiedEl = null;
    _transientContent = null;
    _typeEl = null;
    _urlEl = null;

    _initialize = null;
    _this = null;
  });

  _this.hide = function () {
    _dialog.hide();
    _this.trigger('hide');
  };

  _this.render = function () {
    var date,
        size,
        type,
        url;

    date = _transientContent.get('lastModified');
    if (date || date === 0) {
      date = _formatter.date(new Date(date));
    } else {
      date = '&ndash;';
    }

    size = _transientContent.get('length');
    if (size || size === 0) {
      size = _formatter.fileSize(size);
    } else {
      size = '&ndash;';
    }

    type = _transientContent.get('contentType') || '';

    url = _transientContent.get('url') || '';


    _idEl.value = _transientContent.get('id') || '';
    _typeEl.value = type;

    _lengthEl.innerHTML = size;
    _modifiedEl.innerHTML = date;

    _urlEl.setAttribute('href', url);
    _urlEl.setAttribute('title', url);
    _urlEl.innerHTML = url;
  };

  _this.show = function () {
    _dialog.show();
    _this.trigger('show');
  };


  _initialize(params);
  params = null;
  return _this;
};

module.exports = ProductContentEditView;
