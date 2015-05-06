'use strict';

var AssociateEventView = require('admin/AssociateEventView'),
    EventComparisonView = require('admin/EventComparisonView'),
    CatalogEvent = require('CatalogEvent'),
    Collection = require('mvc/Collection'),
    View = require('mvc/View'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');


var DEFAULTS = {
  SEARCH_STUB: 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson'
};


var EventsNearbyView = function (options) {
  var _this,
      _initialize,

      // variables
      _associateEventView,
      _el,
      _event,
      _nearbyEventsEl,
      _searchStub,
      _eventConfig,

      // methods
      _associateCallback,
      _createView,
      _getSearchUrl;

  options = Util.extend({}, DEFAULTS, options);
  _this = View(options);

  _initialize = function () {
    var section = document.createElement('section');

    _el = _this.el;
    _event = CatalogEvent(options.eventDetails);
    _searchStub = options.eventConfig.SEARCH_STUB || options.SEARCH_STUB;
    _eventConfig = options.eventConfig;
    _associateEventView = null;

    section.classname = 'nearby-event-view';
    section.innerHTML = '<h3>Events Within 15 Minutes</h3>' +
        '<div class="nearby-events"></div>';
    _nearbyEventsEl = section.querySelector('.nearby-events');

    _createView();

    // Append to AdminSummaryPage
    _el.appendChild(section);
    options = null;
  };

  /**
   * Create the nearby events table, this table contains all events within 15
   * minutes of the search and adds an associate action.
   */
  _createView = function () {
    Xhr.ajax({
      url: _getSearchUrl(),
      success: function (data) {
        var events = [],
            feature = null,
            properties = null;

        // Build array of events with event details for Collection
        for (var i = 0; i < data.features.length; i++) {
          feature = data.features[i];
          properties = feature.properties;
          events[i] = {
            'id'         : feature.id,
            'source'     : properties.net,
            'sourceCode' : properties.code,
            'longitude'  : feature.geometry.coordinates[0],
            'latitude'   : feature.geometry.coordinates[1],
            'depth'      : feature.geometry.coordinates[2],
            'time'       : new Date(properties.time),
            'magnitude'  : properties.mag
          };
        }

        // Collection table to display nearby ebents
        EventComparisonView({
          el: _nearbyEventsEl,
          referenceEvent: _event.getSummary(),
          collection: Collection(events),
          buttons: [
            {
              title: 'Associate',
              className: 'associate',
              callback: _associateCallback
            }
          ],
          eventLink: '?eventid={eventid}'
        });

      },
      error: function (status, xhr) {
        _nearbyEventsEl.innerHTML = '<p class="alert error">' +
            '<b>' + status + ': ' + xhr.statusText + '</b><br/>'+
            xhr.responseText + '</p>';
      }
    });
  };


  _associateCallback = function (eventSummary) {
    _associateEventView = AssociateEventView({
      'referenceEvent' : _event.getSummary(),
      'associateEventId': eventSummary.id,
      'eventConfig': _eventConfig
    });
  };

  /**
   * Build a url based on the user's input that searches within
   * 15 minutes of a user supplied time.
   *
   * @return {String},
   *         The web service url that searches a 30 minute time window.
   */
  _getSearchUrl = function () {
    var time,
        starttime,
        endtime,
        url;

    // get event times
    time = _event.getTime();

    // build search url
    starttime = new Date(time.getTime() - 900000);
    endtime = new Date(time.getTime() + 900000);
    url = _searchStub +
        '&orderby=time-asc' +
        '&starttime=' + starttime.toISOString() +
        '&endtime=' + endtime.toISOString();

    return url;
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {

    // methods
    _associateCallback = null;
    _createView = null;

    // variables
    if (_associateEventView !== null) {
      _associateEventView.destroy();
      _associateEventView = null;
    }
      _el = null;
      _event = null;
      _nearbyEventsEl = null;
      _searchStub = null;
  }, _this.destroy);


  _initialize();
  return _this;
};


module.exports = EventsNearbyView;
