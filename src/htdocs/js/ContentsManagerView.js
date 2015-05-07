'use strict';


var FileUploadView = require('FileUploadView'),
    ProductContent = require('ProductContent'),
    ProductContentView = require('ProductContentView'),

    EventModulePage = require('base/EventModulePage'),

    Collection = require('mvc/Collection'),
    CollectionView = require('mvc/CollectionView'),
    View = require('mvc/View'),

    Message = require('util/Message'),
    Util = require('util/Util');


var _ID_SEQUENCE = 0;

var ContentsManagerView = function (params) {
  var _this,
      _initialize,

      _collection,
      _contentsView,
      _destroyCollection,
      _errorsEl,
      _fileUploadView,
      _id,
      _inlineEditEl,
      _inlinePreviewEl,
      _toggleEditModeEl,
      _toggleEl,
      _togglePreviewModeEl,

      _addContent,
      _createSubViews,
      _createViewSkeleton,
      _onFileUpload,
      _onInlineContentChange,
      _onInlineEditChange,
      _onToggleClick;


  _this = View(params);

  _initialize = function (/*params*/) {
    _id = 'contents-manager-view-' + (_ID_SEQUENCE++);
    _collection = _this.model.get('contents');

    _collection.on('add', _onInlineContentChange);
    _collection.on('remove', _onInlineContentChange);

    if (!_collection) {
      _collection = Collection([]);
      _destroyCollection = true;
    }

    _createViewSkeleton();
    _createSubViews();
  };


  _addContent = function (content) {
    var id,
        ids;

    id = content.get('id');
    ids = _collection.getIds(true);

    if (ids.hasOwnProperty(id)) {
      Message({
        container: _errorsEl,
        content: 'Can not create content with duplicate name. ' +
            '&ldquo;' + id + '&rdquo;',
        classes: ['error']
      });
    } else {
      _collection.add(content);
    }
  };

  /**
   * Creates the sub-views for managing file uploads, contents listing and
   * content editing. Must not be called before _createViewSkeleton.
   *
   * @see ContentsManagerView#_createViewSkeleton
   */
  _createSubViews = function () {
    var inline;

    _toggleEl = _this.el.querySelector(
        '.contents-manager-view-inline-content-toggle');
    _toggleEl.addEventListener('click', _onToggleClick);

    _toggleEditModeEl = _toggleEl.querySelector(
        '.contents-manager-view-inline-content-toggle-edit');
    _togglePreviewModeEl = _toggleEl.querySelector(
        '.contents-manager-view-inline-content-toggle-preview');

    _inlineEditEl = _this.el.querySelector(
        '.contents-manager-view-inline-content-edit');
    _inlineEditEl.addEventListener('change', _onInlineEditChange);
    inline = _collection.get('');
    if (inline) {
      inline.on('change', _onInlineContentChange);
    }

    _inlinePreviewEl = _this.el.querySelector(
        '.contents-manager-view-inline-content-preview');

    _errorsEl = _this.el.querySelector('.contents-manager-view-errors');

    _fileUploadView = FileUploadView({
      button: _this.el.querySelector('.contents-manager-view-attach'),
      el: _this.el,
      hideOnSuccess: true,
      upload: _this.el.querySelector('.contents-manager-view-errors')
    });
    _fileUploadView.on('upload', _onFileUpload);

    _contentsView = CollectionView({
      el: _this.el.querySelector('.contents-manager-view-contents-view'),
      collection: _collection,
      factory: ProductContentView
    });
  };

  _createViewSkeleton = function () {
    _this.el.classList.add('contents-manager-view');

    _this.el.innerHTML = [
      '<small>',
        'This content may include HTML markup. ',
        'Within the inline content you may reference attached files by ',
        'their file names. For example, you may upload an image then ',
        'reference that image name as an <code>&lt;img&gt;</code> ',
        'tag&rsquo;s &ldquo;src&rdquo; attribute. You may upload a file ',
        'by clicking the &ldquo;Add File&rdquo; button or dragging and ',
        'dropping the file onto the text area.',
      '</small>',
      '<div class="contents-manager-view-inline-content">',
        '<span class="contents-manager-view-inline-content-toggle">',
          '[<span class="contents-manager-view-inline-content-toggle-edit">',
            'Edit Content',
          '</span> | ',
          '<span class="link ',
              'contents-manager-view-inline-content-toggle-preview">',
            'View Preview',
          '</span>]',
        '</span>',
        '<textarea class="contents-manager-view-inline-content-edit" ',
            'aria-label="Inline content text"></textarea>',
        '<div class="hidden contents-manager-view-inline-content-preview">',
            '</div>',
      '</div>',
      '<button class="confirm contents-manager-view-attach">Add File</button>',
      '<div class="contents-manager-view-errors"></div>',
      '<div class="contents-manager-view-contents-view"></div>'
    ].join('');
  };

  _onFileUpload = function (file) {
    var params;

    params = {
      contentType: file.contentType,
      id: file.name,
      lastModified: file.lastModified,
      length: file.length
    };

    if (file.hasOwnProperty('url') && file.url !== null) {
      params.url = file.url;
    } else if (file.hasOwnProperty('bytes') && file.bytes !== null) {
      params.bytes = file.bytes;
    }

    _addContent(ProductContent(params));
  };

  _onInlineEditChange = function () {
    var attributes,
        text,
        inline;

    text = _inlineEditEl.value;
    inline = _collection.get('');

    if (text !== '') {
      // We have content, update or create the '' ProductContent in collection
      attributes = {
        id: '',
        bytes: text,
        length: text.length,
        contentType: 'text/html',
        lastModified: (new Date()).getTime()
      };

      if (!inline) {
        inline = ProductContent(attributes);
        _collection.add(inline);
      } else {
        inline.set(attributes);
      }
    } else {
      // We do not have contentm remove the '' ProductContent from collection
      if (inline) {
        _collection.remove(inline);
      }
    }
  };

  _onInlineContentChange = function () {
    var bytes,
        inline;

    inline = _collection.get('');

    if (inline) {
      bytes = inline.get('bytes');
      _inlineEditEl.value = bytes;
      _inlinePreviewEl.innerHTML =
          EventModulePage.prototype._replaceRelativePaths(
              bytes, _this.model.toJSON().contents);
    } else {
      _inlineEditEl.value = '';
      _inlinePreviewEl.innerHTML = '';
    }
  };

  _onToggleClick = function (evt) {
    if (evt.target.classList.contains('link')) {
      _toggleEditModeEl.classList.toggle('link');
      _togglePreviewModeEl.classList.toggle('link');

      _inlineEditEl.classList.toggle('hidden');
      _inlinePreviewEl.classList.toggle('hidden');
    }
  };


  _this.destroy = Util.compose(function () {
    var inline;

    inline = _collection.get('');
    if (inline) {
      inline.off('change', _onInlineContentChange);
    }

    if (_destroyCollection) {
      _collection.destroy();
    }

    _contentsView.destroy();

    _fileUploadView.off('upload', _onFileUpload);
    _fileUploadView.destroy();

    _inlineEditEl.removeEventListener('change', _onInlineEditChange);

    _toggleEl.removeEventListener('click', _onToggleClick);


    _collection = null;
    _contentsView = null;
    _destroyCollection = null;
    _errorsEl = null;
    _fileUploadView = null;
    _id = null;
    _inlineEditEl = null;
    _inlinePreviewEl = null;
    _toggleEditModeEl = null;
    _toggleEl = null;
    _togglePreviewModeEl = null;

    _addContent = null;
    _createSubViews = null;
    _createViewSkeleton = null;
    _onFileUpload = null;
    _onInlineContentChange = null;
    _onInlineEditChange = null;
    _onToggleClick = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _initialize(params);
  params = null;
  return _this;
};

module.exports = ContentsManagerView;
