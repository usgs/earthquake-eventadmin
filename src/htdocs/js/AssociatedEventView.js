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
      _associatedEventCallback,
      _createView;

  options = Util.extend({}, options);
  _this = View(options);

  _initialize = function () {
    _el = _this.el;
    _event = CatalogEvent(options.eventDetails);

    _el.innerHTML = '<h3>Associated Events</h3>' +
        '<div class="associated-events"></div>';
    _associatedEventsEl = _el.querySelector('.associated-events');

    _createView();
  };

  _createView = function () {
    var key = null,
        subEvents = _event.getSubEvents(),
        products = [];

    for (key in subEvents) {
      products.push(subEvents[key].getSummary());
    }

    // Collection table inserts markup via innerHTML
    EventComparisonView({
      el: _associatedEventsEl,
      referenceEvent: _event.getSummary(),
      collection: new Collection(products),
      buttons: [
        {
          title: 'Disassociate',
          className: 'disassociate'
        }
      ],
      callback: _associatedEventCallback
    });
  };

  _associatedEventCallback = function (e) {
    if (e.target.nodeName === 'BUTTON') {
      console.log('disassociate: ' + e.target.getAttribute('data-id'));
    }
  };

  _initialize();
  return _this;
};


module.exports = AssociatedEventView;
