'use strict';

var EventComparisonView = require('admin/EventComparisonView'),
    CatalogEvent = require('CatalogEvent'),
    Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View'),
    Product = require('Product'),
    SendProductView = require('admin/SendProductView');


var AssociatedEventView = function (options) {

  var _this,
      _initialize,

      // variables
      _associatedEventsEl,
      _el,
      _event,
      _sendProductView,
      _subEvents,

      // methods
      _disassociateCallback,
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
    options = null;
  };

  /**
   * Create the associated events table, this table contains all sub-events
   * a disassociate button.
   */
  _createView = function () {
    var id = null,
        events = [];

    _subEvents = _event.getSubEvents();

    for (id in _subEvents) {
      events.push(_subEvents[id].getSummary());
    }

    // Collection table inserts markup via innerHTML
    EventComparisonView({
      el: _associatedEventsEl,
      referenceEvent: _event.getSummary(),
      collection: Collection(events),
      buttons: [
        {
          title: 'Disassociate',
          className: 'disassociate',
          callback: _disassociateCallback
        }
      ]
    });
  };

  /**
   * Disassociates a subevent from the event.
   *
   * @param  {object} eventSummary,
   *         summary of the event to be removed
   */
  _disassociateCallback = function (eventSummary) {
    var referenceEvent = _event.getSummary(),
        product,
        productSent;

    // create disassociate product
    product = Product({
      source: 'admin',
      type: 'disassociate',
      code: referenceEvent.id + '_' + eventSummary.id,
      properties: {
        eventsource: referenceEvent.source,
        eventsourcecode: referenceEvent.sourceCode,
        othereventsource: eventSummary.source,
        othereventsourcecode: eventSummary.sourceCode
      }
    });

    // send product
    _sendProductView = SendProductView({
      product: product,
      formatProduct: function (product) {
        // show products that will be disassociated
        var subEvent,
            products;

        subEvent = _subEvents[eventSummary.id];
        products = CatalogEvent.productMapToList(subEvent.getProducts());
        return _sendProductView.formatProduct(product) +
            '<h4>These products will be disassociated</h4>' +
            '<ul>' +
            products.map(function (p) {
              return '<li>' + p.id + '</li>';
            }).join('') +
            '</ul>';
      }
    });
    _sendProductView.on('success', function () {
      // track that product was sent
      productSent = true;
    });
    _sendProductView.on('cancel', function () {
      if (productSent) {
        // product was sent, which will modify the event
        // reload page to see update
        window.location.reload();
      } else {
        // product not sent, cleanup
        product = null;
        _sendProductView.destroy();
        _sendProductView = null;
      }
    });
    _sendProductView.show();
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {

    // methods
    _disassociateCallback = null;
    _createView = null;

    // variables
    if (_sendProductView !== null) {
      _sendProductView.destroy();
      _sendProductView = null;
    }
    _associatedEventsEl = null;
    _el = null;
    _event = null;
    _subEvents = null;
  }, _this.destroy);


  _initialize();
  return _this;
};


module.exports = AssociatedEventView;
