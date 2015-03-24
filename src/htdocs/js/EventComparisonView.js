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
            return _formatter.time(data.time) + (_referenceEvent.id !== data.id ? ' <small>(' + _formatter.diff(_referenceEvent.time, data.time) + ')</small>' : '');
          }
        },
        {
          className: 'magnitude',
          title: 'Magnitude',
          format: function (data) {
            return _formatter.round(data.magnitude) + (_referenceEvent.id !== data.id ? ' <small>(' +_formatter.diff(_referenceEvent.magnitude, data.magnitude) + ')</small>' : '');
          }
        },
        {
          className: 'latitude',
          title: 'Latitude',
          format: function (data) {
            return _formatter.round(data.latitude) + (_referenceEvent.id !== data.id ? ' <small>(' +_formatter.diff(_referenceEvent.latitude, data.latitude) + ')</small>' : '');
          }
        },
        {
          className: 'longitude',
          title: 'Longitude',
          format: function (data) {
            return _formatter.round(data.longitude) + (_referenceEvent.id !== data.id ? ' <small>(' +_formatter.diff(_referenceEvent.longitude, data.longitude) + ')</small>' : '');
          }
        },
        {
          className: 'depth',
          title: 'Depth',
          format: function (data) {
            return _formatter.round(data.depth) + (_referenceEvent.id !== data.id ? ' <small>(' +_formatter.diff(_referenceEvent.depth, data.depth) + ')</small>' : '');
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
      _el = options.el,
      _buttons = options.buttons || [],
      _formatter = new Formatter({round: 3, empty: '&ndash;'}),
      _referenceEvent = options.referenceEvent,

      // methods
      _registerListeners;

  options = Util.extend({}, DEFAULTS, options || {});
  _this = CollectionTable(options);

  _initialize = function () {
    // Register listeners for all buttons in the view
    for(var i = 0; i < _buttons.length; i++) {
      _registerListeners(_el.querySelectorAll('.' + _buttons[i].className),
          _buttons[i].callback);
    }
  };

  _registerListeners = function (elementArray, callback) {
    var element = null;

    for (var i = 0; i < elementArray.length; i++) {
      element = elementArray[i];
      element.addEventListener('click', callback);
    }
  };

  _initialize();
  return _this;
};


module.exports = EventComparisonView;
