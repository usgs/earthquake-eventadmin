'use strict';

var CatalogEvent = require('./CatalogEvent'),
    EventComparisonView = require('./EventComparisonView'),
    Collection = require('mvc/Collection'),
    View = require('mvc/View'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');


var DEFAULTS = {
  url: 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'
};


var NearbyEventView = function (options) {
  var _this,
      _initialize,
      // variables
      _el,
      _event,
      _nearbyEventsEl,
      _url,
      // methods
      _associateCallback,
      _createView,
      _getSearchUrl;

  options = Util.extend({}, DEFAULTS, options);
  _this = View(options);

  _initialize = function () {
    _el = options.el;
    _event = CatalogEvent(options.eventDetails);
    _url = _getSearchUrl();

    _el.innerHTML = '<h3>Nearby Events</h3>' +
        '<div class="nearby-events"></div>';
    _nearbyEventsEl = _el.querySelector('.nearby-events');

    // TODO, get nearby events
    _createView();
  };

  /**
   * Create the nearby events table, this table contains all events within 15
   * minutes of the search and adds an associate action.
   */
  _createView = function () {
    Xhr.ajax({
      url: _url,
      success: function (data) {
        var events = [],
            feature = null,
            properties = null;

        console.log(data);
        _nearbyEventsEl.innerHTML = '<p>There are ' + data.metadata.count +
            ' events within a fifteen minute window of the event.</p>';

        // Build events array with details for Collection
        for (var i = 0; i < data.features.length; i++) {
          feature = data.features[i];
          properties = feature.properties;
          events[i] = {
            'id'        : feature.id,
            'longitude' : feature.geometry.coordinates[0],
            'latitude'  : feature.geometry.coordinates[1],
            'depth'     : feature.geometry.coordinates[2],
            'time'      : new Date(properties.time),
            'magnitude' : properties.mag,
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
          ]
        });
        
      },
      error: function () {},
    });
  };


  _associateCallback = function (data) {
    // TODO, pop-up dialog with confirmation to associate
    console.log(data);
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
    url = 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' +
        '&starttime=' + starttime.toISOString() +
        '&endtime=' + endtime.toISOString();

    return url;
  };


  _initialize();
  return _this;
};


module.exports = NearbyEventView;
