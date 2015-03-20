'use strict';


var CatalogEvent = require('./CatalogEvent'),
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
      _event,
      // methods
      _getEventUrl,
      _loadEvent;

  _this = View(options);

  _initialize = function () {
    options = Util.extend({}, DEFAULTS, options);
    _config = options.config;
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
        _this.render();
      },
      error: function () {
        _this.el.innerHTML = '<p class="alert error">Unable to Load Event</p>';
      }
    });
  };

  _this.render = function () {
    if (_event === null) {
      return;
    }

    _this.el.innerHTML = JSON.stringify(_event.getSummary());
  };


  _initialize();
  return _this;
};


module.exports = EventAdminView;
