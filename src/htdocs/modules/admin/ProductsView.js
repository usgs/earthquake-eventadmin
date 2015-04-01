'use strict';

var CollectionTable = require('mvc/CollectionTable'),
    Formatter = require('Formatter'),
    Util = require('util/Util');

var DEFAULTS = {
    className: 'collection-table event-comparison tabular',
    buttons: null
  };


var ProductsView = function (options) {

  var _this,
      _initialize,

      // private variables
      _buttons = options.buttons || [],
      _callbackMap = {},
      _collection = options.collection,
      _collectionTable = null,
      _formatter = Formatter({round: 3, empty: '&ndash;'}),
      _preferredProduct = options.preferredProduct,

      // private methods
      _getColumns,
      _onClick;

  _this = {};

  _initialize = function () {
    var title =  null;

    options = Util.extend({}, DEFAULTS, options);
    options.columns = _getColumns();
    _collectionTable = CollectionTable(options);

    // Build callback map, keys a button.classname with its callback parameter
    for (var i = 0; i < _buttons.length; i++) {
      title = _buttons[i].title;
      if (_callbackMap.hasOwnProperty(title)) {
        throw new Error('Buttons must use different title values.');
      } else {
        _callbackMap[title] = _buttons[i].callback;
      }
    }

    // add click handler to CollectionTable
    _collectionTable.el.addEventListener('click', _onClick);
    options = null;
  };

  /**
   * Click handler that delegates the proper callback when a button is
   * clicked on in the CollectionTable.
   */
  _onClick = function (e) {
    var element = e.target,
        eventid = null,
        title = null;

    if (element.nodeName.toUpperCase() === 'BUTTON') {
      eventid = element.getAttribute('data-id');
      title = element.innerHTML;
      // execute callback for the button with the matching classname
      _callbackMap[title](_collection.get(eventid));
    }
  };

  _getColumns = function () {
    return [
      {
        className: 'source',
        title: 'Source',
        format: function (data) {
          return data.source || '&ndash;';
        }
      },
      // {
      //   className: 'type',
      //   title: 'Type',
      //   format: function (data) {
      //     return data.type || '&ndash;';
      //   }
      // },
      {
        className: 'code',
        title: 'Code',
        format: function (data) {
          return data.code || '&ndash;';
        }
      },
      {
        className: 'indextime',
        title: 'Update Time',
        format: function (data) {
          return data.indexTime || '&ndash;';
        }
      },
      {
        className: 'actions',
        title: 'Actions',
        format: function (data) {
          var buf = [],
              i =0;

          if (_preferredProduct === data) {
            buf.push('<button disabled>Make Preferred</button>');
            i = 1;
          }

          for (i; i < _buttons.length; i++) {
            buf.push('<button class="' + _buttons[i].className +
                '" data-id="' + data.id + '">' + _buttons[i].title +
                '</button>');
          }

          return buf.join('');
        }
      }
    ];
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = function () {

      // Remove event listeners
      _collectionTable.el.removeEventListener('click', _onClick);

      // clean up private methods
      _getColumns = null;
      _onClick = null;

      // clean up private variables
      _buttons = null;
      _callbackMap = null;
      _collection = null;
      _collectionTable = null;
      _formatter = null;
      _preferredProduct = null;
  };

  _initialize();
  return _this;
};


module.exports = ProductsView;
