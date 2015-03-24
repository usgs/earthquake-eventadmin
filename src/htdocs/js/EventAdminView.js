'use strict';


var CatalogEvent = require('./CatalogEvent'),
    Collection = require('mvc/Collection'),
    EventComparisonView = require('./EventComparisonView'),
    Util = require('util/Util'),
    View = require('mvc/View'),
    Xhr = require('util/Xhr');


var DEFAULTS = {
  config: {
    offsiteHost: 'earthquake.usgs.gov',
    detailsStub: '/earthquakes/feed/v1.0/detail/%s.geojson'
  }
};


var EventAdminView = function (options) {
  var _this,
      _initialize,
      // variables
      _config,
      _el,
      _event,
      _subEvents,
      // methods
      _getEventUrl,
      _loadEvent;

  _this = View(options);

  _initialize = function () {
    options = Util.extend({}, DEFAULTS, options);
    _config = options.config;
    _el = options.el || document.createElement('div');
    _event = null;
    _loadEvent();
    options = null;
  };

  _getEventUrl = function () {
    var url = '//' + _config.offsiteHost +
        _config.detailsStub.replace('%s', _config.eventId);
    return url;
  };

  _loadEvent = function () {
    Xhr.ajax({
      url: _getEventUrl(),
      success: function (data) {
        var products = data.properties.products;
        data.properties.products = null;
        _event = CatalogEvent(products, data.properties);
        _subEvents = _event.getSubEvents();
        _this.render();
      },
      error: function () {
        _this.el.innerHTML = '<p class="alert error">Unable to Load Event</p>';
      }
    });
  };

  _this.render = function () {
    var subEvents = [],
        subEvent;

    for (subEvent in _subEvents) {
      subEvents.push(_subEvents[subEvent].getSummary());
    }

    if (_event === null) {
      return;
    }

    EventComparisonView({
      el: _el,
      collection: Collection(subEvents)
    });

    //_this.el.innerHTML = JSON.stringify(_event.getSummary());
  };


  _initialize();
  return _this;
};


module.exports = EventAdminView;
