'use strict';

var Formatter = require('admin/Formatter'),
    ProductContentEditView = require('admin/ProductContentEditView'),

    View = require('mvc/View'),

    Util = require('util/Util');


/**
 * This view renders a single ProductContent model in the DOM. This is a
 * read-only rendering.
 *
 * @see ProductContentsView
 * @see ProductContentEditView
 */
var ProductContentView = function (options) {
  var _this,
      _initialize,

      _collection,
      _editView,
      _formatter,

      _onClick,
      _onEditComplete,
      _updateId;


  _this = View(options);

  _initialize = function (options) {
    var path = _this.model.get('id');

    if (path === '') {
      path = 'inline';
    }
    path = path.replace(/\\/g, '-');

    _collection = options.collection;
    _formatter = options.formatter || Formatter({round: 1});

    _this.el.classList.add('product-content-view');
    _this.el.classList.add('product-content-' + path);
    _this.el.addEventListener('click', _onClick);

    _this.model.on('change:id', _updateId);

    // Auto-render content now...
    _this.render();
  };


  _onClick = function (evt) {
    var target = evt.target;

    if (target.classList.contains('edit')) {
      _editView = ProductContentEditView({
        model: _this.model
      });
      _editView.on('hide', _onEditComplete);
      _editView.show();
    } else if (target.classList.contains('delete') && _collection) {
      _collection.remove(_this.model);
    }
  };

  _onEditComplete = function () {
    if (_editView) {
      _editView.destroy();
      _editView = null;
    }
  };

  _updateId = function () {
    _this.id = _this.model.get('id');
  };


  _this.destroy = Util.compose(function () {
    _this.model.off('change:id', _updateId);
    _this.el.removeEventListener('click', _onClick);

    _onEditComplete();

    _collection = null;
    _editView = null;
    _formatter = null;

    _onClick = null;
    _onEditComplete = null;
    _updateId = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.render = function () {
    var date,
        title;

    date = _this.model.get('lastModified');
    if (date || date === 0) {
      date = _formatter.date(new Date(date));
    } else {
      date = '&ndash;';
    }

    title = _this.model.get('id');
    if (title === '') {
      title = '<em>&lt;inline&gt;</em>';
    }

    /* eslint-disable */
    _this.el.innerHTML = [
      '<span class="title">', title, '</span>',
      '<span class="subtitle">',
        '<span class="date">', date, '</span>',
        ' <span class="size">',
          '(', _formatter.fileSize(_this.model.get('length')), ')',
        '</span>',
      '</span>',
      '<span class="buttons button-group">',
        '<button class="edit" title="Edit">&#x270E;</button>',
        '<button class="delete" title="Delete">&times;</button>',
      '</span>'
    ].join('');
    /* eslint-enable */
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = ProductContentView;
