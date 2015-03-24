'use strict';

var CollectionTable = require('mvc/CollectionTable'),
    Formatter = require('./Formatter'),
    Util = require('util/Util');


var EventComparisonView = function (options) {

  var formatter = new Formatter({round: 3, empty: '&ndash;'}),
      referenceEvent = options.referenceEvent,
      DEFAULTS = {
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
              return formatter.time(data.time) + (referenceEvent.id !== data.id ? ' <small>(' + formatter.diff(referenceEvent.time, data.time) + ')</small>' : '');
            }
          },
          {
            className: 'magnitude',
            title: 'Magnitude',
            format: function (data) {
              return data.magnitude + (referenceEvent.id !== data.id ? ' <small>(' +formatter.diff(referenceEvent.magnitude, data.magnitude) + ')</small>' : '');
            }
          },
          {
            className: 'latitude',
            title: 'Latitude',
            format: function (data) {
              return data.latitude + (referenceEvent.id !== data.id ? ' <small>(' +formatter.diff(referenceEvent.latitude, data.latitude) + ')</small>' : '');
            }
          },
          {
            className: 'longitude',
            title: 'Longitude',
            format: function (data) {
              return data.longitude + (referenceEvent.id !== data.id ? ' <small>(' +formatter.diff(referenceEvent.longitude, data.longitude) + ')</small>' : '');
            }
          },
          {
            className: 'depth',
            title: 'Depth',
            format: function (data) {
              return data.depth + (referenceEvent.id !== data.id ? ' <small>(' +formatter.diff(referenceEvent.depth, data.depth) + ')</small>' : '');
            }
          },
          {
            className: 'actions',
            title: 'Actions',
            format: function (data) {
              if (referenceEvent.id === data.id) {
                return '<b>This Event</b>';
              } else {
                return '<button data-id="' + data.id + '">disassociate</button>';
              }
            }
          }
        ],
        emptyMarkup: '&ndash;'
    };

  options = Util.extend({}, DEFAULTS, options || {});

  CollectionTable.call(this, options);
};

EventComparisonView.prototype = Object.create(CollectionTable.prototype);


module.exports = EventComparisonView;
