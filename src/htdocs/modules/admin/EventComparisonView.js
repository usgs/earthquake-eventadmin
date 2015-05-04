'use strict';

var CollectionTable = require('mvc/CollectionTable'),
    Formatter = require('Formatter'),
    Util = require('util/Util');

var DEFAULTS = {
    className: 'collection-table event-comparison tabular',
    emptyMarkup: '&ndash;',
    buttons: null
  };


var EventComparisonView = function (options) {

  var _this,
      _initialize,

      // private variables
      _buttons = options.buttons || [],
      _callbackMap = {},
      _collection = options.collection,
      _collectionTable = null,
      _formatter = Formatter({round: 3, empty: '&ndash;'}),
      _referenceEvent = options.referenceEvent,

      // private methods
      _getColumns,
      _onClick;

  _this = {};

  _initialize = function () {
    var title =  null,
        referenceEventRow;

    options = Util.extend({}, DEFAULTS, options);
    options.columns = _getColumns();
    _collectionTable = CollectionTable(options);

    // highlight current event in the comparison table
    referenceEventRow = _collectionTable.el.querySelector(
        '[data-id="' + _referenceEvent.id + '"]');
    referenceEventRow.classList.add('reference-event');

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
        className: 'eventid',
        title: 'Event ID',
        format: function (data) {
          return data.id;
        }
      },
      {
        className: 'time',
        title: 'Time',
        format: function (data) {
          return _formatter.time(data.time) +
              (_referenceEvent.id === data.id ? '' :
              ' <small class="value-diff">(' +
                _formatter.diff(_referenceEvent.time, data.time) +
              ')</small>');
        }
      },
      {
        className: 'magnitude',
        title: 'Magnitude',
        format: function (data) {
          return _formatter.round(data.magnitude) +
              (_referenceEvent.id === data.id ? '' :
              ' <small class="value-diff">(' +
                _formatter.diff(_referenceEvent.magnitude, data.magnitude) +
              ')</small>');
        }
      },
      {
        className: 'latitude',
        title: 'Latitude',
        format: function (data) {
          return _formatter.round(data.latitude) +
              (_referenceEvent.id === data.id ? '' :
              ' <small class="value-diff">(' +
                _formatter.diff(_referenceEvent.latitude, data.latitude) +
              ')</small>');
        }
      },
      {
        className: 'longitude',
        title: 'Longitude',
        format: function (data) {
          return _formatter.round(data.longitude) +
              (_referenceEvent.id === data.id ? '' :
              ' <small class="value-diff">(' +
              _formatter.diff(_referenceEvent.longitude, data.longitude) +
              ')</small>');
        }
      },
      {
        className: 'depth',
        title: 'Depth',
        format: function (data) {
          return _formatter.round(data.depth) +
              (_referenceEvent.id === data.id ? '' :
              ' <small class="value-diff">(' +
              _formatter.diff(_referenceEvent.depth, data.depth) +
              ')</small>');
        }
      },
      {
        className: 'actions',
        title: 'Actions',
        format: function (data) {
          var buf;

          if (_referenceEvent.id === data.id) {
            return '<button disabled>This Event</button>';
          }

          buf = [];

          for (var i = 0; i < _buttons.length; i++) {
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
      _referenceEvent = null;
  };

  _initialize();
  return _this;
};


module.exports = EventComparisonView;
