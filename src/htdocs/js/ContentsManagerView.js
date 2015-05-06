'use strict';


var FileUploadView = require('FileUploadView'),
    ProductContent = require('ProductContent'),
    ProductContentView = require('ProductContentView'),

    Collection = require('mvc/Collection'),
    CollectionView = require('mvc/CollectionView'),
    View = require('mvc/View'),

    Message = require('util/Message'),
    Util = require('util/Util');


var ContentsManagerView = function (params) {
  var _this,
      _initialize,

      _collection,
      _contentsView,
      _destroyCollection,
      _errorsEl,
      _fileUploadView,

      _addContent,
      _createSubViews,
      _createViewSkeleton,
      _onFileUpload;


  _this = View(params);

  _initialize = function (/*params*/) {
    _collection = _this.model.get('contents');

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
    _errorsEl = _this.el.querySelector('.contents-manager-view-errors');

    _fileUploadView = FileUploadView({
      el: _this.el.querySelector('.contents-manager-view-upload-view'),
      hideOnSuccess: true
    });

    _contentsView = CollectionView({
      el: _this.el.querySelector('.contents-manager-view-contents-view'),
      collection: _collection,
      factory: ProductContentView
    });


    _fileUploadView.on('upload', _onFileUpload);
  };

  _createViewSkeleton = function () {
    _this.el.innerHTML = [
      '<div class="contents-manager-view-contents-view"></div>',
      '<div class="contents-manager-view-errors"></div>',
      '<div class="contents-manager-view-upload-view"></div>'
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


  _this.destroy = Util.compose(function () {
    if (_destroyCollection) {
      _collection.destroy();
    }

    _contentsView.destroy();

    _fileUploadView.off('upload', _onFileUpload);
    _fileUploadView.destroy();


    _collection = null;
    _contentsView = null;
    _destroyCollection = null;
    _errorsEl = null;
    _fileUploadView = null;

    _addContent = null;
    _createSubViews = null;
    _createViewSkeleton = null;
    _onFileUpload = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _initialize(params);
  params = null;
  return _this;
};

module.exports = ContentsManagerView;
