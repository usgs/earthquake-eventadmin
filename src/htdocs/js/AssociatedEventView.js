'use strict';

var EventComparisonView = require('./EventComparisonView'),
    CatalogEvent = require('./CatalogEvent'),
    Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View');

var AssociatedEventView = function (options) {
  var _this,
      _initialize,

      // variables
      _associatedEventsEl,
      _el,
      _event,

      // methods
      createView,
      callback;


  _this = View(options);

  _initialize = function () {
    options = Util.extend({}, options);
    _el = _this.el;
    _event = CatalogEvent(options.eventDetails);

    _el.innerHTML = '<h3>Associated Events</h3>' +
        '<div class="associated-events"></div>';
    _associatedEventsEl = _el.querySelector('.associated-events');

    createView();
  };

  createView = function () {
    var key = null,
        subEvents = _event.getSubEvents(),
        products = [];

    // TODO parse products into 
    console.log(_event.getSubEvents());

    for (key in subEvents) {
      products.push(subEvents[key].getSummary());
    }

    // Collection table inserts markup via innerHTML
    EventComparisonView({
      el: _associatedEventsEl,
      referenceEvent: _event.getSummary(),
      collection: new Collection(products)
    });
  };

  callback = function () {
    console.log('callback');
  };

  _initialize();
  return _this;
};



module.exports = AssociatedEventView;
