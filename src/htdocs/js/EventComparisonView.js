'use strict';

var CollectionTable = require('mvc/CollectionTable'),
    Formatter = require('./Formatter'),
    Util = require('util/Util');


var EventComparisonView = function (options) {

  var DEFAULTS = {
      className: 'collection-table event-comparison tabular',
      columns: [
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
                (_referenceEvent.id !== data.id? ' <small>(' +
                _formatter.diff(_referenceEvent.time, data.time) +
                ')</small>' : '');
          }
        },
        {
          className: 'magnitude',
          title: 'Magnitude',
          format: function (data) {
            return _formatter.round(data.magnitude) +
                (_referenceEvent.id !== data.id ? ' <small>(' +
                _formatter.diff(_referenceEvent.magnitude, data.magnitude) +
                ')</small>' : '');
          }
        },
        {
          className: 'latitude',
          title: 'Latitude',
          format: function (data) {
            return _formatter.round(data.latitude) +
                (_referenceEvent.id !== data.id ? ' <small>(' +
                _formatter.diff(_referenceEvent.latitude, data.latitude) +
                ')</small>' : '');
          }
        },
        {
          className: 'longitude',
          title: 'Longitude',
          format: function (data) {
            return _formatter.round(data.longitude) +
                (_referenceEvent.id !== data.id ? ' <small>(' +
                _formatter.diff(_referenceEvent.longitude, data.longitude) +
                ')</small>' : '');
          }
        },
        {
          className: 'depth',
          title: 'Depth',
          format: function (data) {
            return _formatter.round(data.depth) +
                (_referenceEvent.id !== data.id ? ' <small>(' +
                _formatter.diff(_referenceEvent.depth, data.depth) +
                ')</small>' : '');
          }
        },
        {
          className: 'actions',
          title: 'Actions',
          format: function (data) {
            var buf = [];

            if (_referenceEvent.id === data.id) {
              return '<b>This Event</b>';
            }

            if (_buttons.length !== 0) {
              for (var i = 0; i < _buttons.length; i++) {
                buf.push('<button class="', _buttons[i].className,
                    '" data-id="', data.id, '">', _buttons[i].title,
                    '</button>');
              }
            }

            if (buf.length !== 0) {
              return buf.join('');
            } else {
              return '';
            }
          }
        }
      ],
      emptyMarkup: '&ndash;'
    };

  var _this,
      _initialize,

      // private variables
      _buttons = options.buttons || [],
      _callbackMap = {},
      _collection = options.collection,
      _el = options.el,
      _formatter = new Formatter({round: 3, empty: '&ndash;'}),
      _referenceEvent = options.referenceEvent,

      // private methods
      _onClick;

  options = Util.extend({}, DEFAULTS, options || {});
  _this = CollectionTable(options);

  _initialize = function () {
    var className =  null;

    // TODO, build button map
    for (var i = 0; i < _buttons.length; i++) {
      className = _buttons[i].className;
      if (!_callbackMap.hasOwnProperty(className)) {
        _callbackMap[className] = _buttons[i].callback;
      }
    }

    // add click handler
    _el.addEventListener('click', _onClick);
  };

  _onClick = function () {
    var eventid = null,
        className = null;

    if (event.target.nodeName.toUpperCase() === 'BUTTON') {
      eventid = event.target.getAttribute('data-id');
      className = event.target.className;
      // execute callback for button with matching classname
      _callbackMap[className](_collection.get(eventid));
    }
  };

  _initialize();
  return _this;
};


module.exports = EventComparisonView;
