'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ModalView = require('mvc/ModalView'),
    View = require('mvc/View'),

    Util = require('util/Util'),
    Xhr = require('util/Xhr');

var DEFAULTS = {
  detailsUrl: 'http://dev-earthquake.cr.usgs.gov/earthquakes/feed/v1.0/detail/'
};

var AssociateEventView = function (options) {
  var _this,
      _initialize,

      // variables
      _associateEvent,
      _associateEventId,
      _associateProducts = [],
      _detailsUrl,
      _dialog,
      _infoEl,
      _referenceEvent,

      // methods
      _findMatchingSource,
      _generateAssociateProducts,
      _getContent,
      _onCancel,
      _onConfirm;

  _this = View(options);

  _initialize = function () {
    var el = _this.el;

    options = Util.extend({}, DEFAULTS, options);

    _referenceEvent = options.referenceEvent;
    _associateEventId = options.associateEventId;
    _detailsUrl = options.detailsUrl;

    el.innerHTML = '<div class="associate-event"></div>';
    _infoEl = el.querySelector('.associate-event');

    // show modal dialog
    _dialog = ModalView(el, {
      title: 'Associate Event',
      closable: false,
      message: _getContent(),
      buttons: [
        {
          classes: ['confirm', 'green'],
          text: 'Associate',
          callback: _onConfirm
        },
        {
          classes: ['cancel'],
          text: 'Cancel',
          callback: _onCancel
        }
      ]
    });

    _dialog.show();

    options = null;
  };

  _onConfirm = function () {
    _dialog.hide();
  };

  _onCancel = function () {
    _dialog.hide();
  };


  /**
   * Build content for SendProductView
   *
   */
  _getContent = function () {
    Xhr.ajax({
      url: _detailsUrl + _associateEventId + '.geojson',
      success: function (data) {
        var associateEvent = CatalogEvent(data).getSummary(),
            matchingEventSource = _findMatchingSource(associateEvent);

        // check if there is a matching event source
        if (matchingEventSource !== null) {
          // build an associate product for each id with the matching source
          _associateProducts = _generateAssociateProducts(matchingEventSource, associateEvent);
        } else {
          // TODO, associate the preferred eventsource and eventsourcecode
          _associateProducts.push(Product({
            source: 'admin',
            type: 'associate',
            code: _referenceEvent.source + _referenceEvent.sourceCode + '_' +
                associateEvent.source + associateEvent.sourceCode,
            properties: {
              eventsource: _referenceEvent.source,
              eventsourcecode: _referenceEvent.sourceCode,
              othereventsource: associateEvent.source,
              othereventsourcecode: associateEvent.sourceCode
            }
          }));
        }

        // TODO, DELETE with modal dialog and actually present the products
        // in the SendProductView
        for (var i = 0; i < _associateProducts.length; i++) {
          _infoEl.innerHTML = '<h4>Associate Product</h4><pre><code>' + JSON.stringify(_associateProducts[i].get(), null, '  ') + '</code></pre></div>';
        }

        _infoEl.innerHTML +=
            '<div class="row">' +
            '<div class="column one-of-two"><h4>Reference Event</h4><pre><code>' + JSON.stringify(_referenceEvent, null, '  ') + '</code></pre></div>' +
            '<div class="column one-of-two"><h4>Event to Associate</h4><pre><code>' + JSON.stringify(associateEvent, null, '  ') + '</code></pre></div>' +
            '</div>';
      },
      error: function (e) {
        console.log(e.message);
      }
    });
  };


  /**
   * Builds an array of associate products when the two events that are being
   * associated share an event solution from the same source. Occasionally,
   * multiple associate products must be generated to force an association.
   *
   * @param  source {String},
   *         The source that is shared between the two events.
   * @param  associateEvent {Object} associateEvent [description]
   *         The event that is being associated.
   *
   * @return {Array<Object>}
   *         An array of associate products
   */
  _generateAssociateProducts = function (source, associateEvent) {
    var products = [],
        associateEventCodes = associateEvent.eventCodes[source],
        referenceEventCodes = _referenceEvent.eventCodes[source],
        x, i;

    for (i = 0; i < referenceEventCodes.length; i++) {
      for (x = 0; x < associateEventCodes.length; x++) {
        products.push(
          Product({
            source: 'admin',
            type: 'associate',
            code: source + referenceEventCodes[i] + '_' +
                source + associateEventCodes[x],
            properties: {
              eventsource: source,
              eventsourcecode: referenceEventCodes[i],
              othereventsource: source,
              othereventsourcecode: associateEventCodes[x]
            }
          })
        );
      }
    }

    return products;
  };


  /**
   * Finds the matching eventSource that is preventing association by
   * comparing eventCodes on the event you are trying to associate against
   * the reference event.
   *
   * @param  associateEventSummary {Object}
   *         The event to be associated
   *
   * @return {String}
   *         The network source
   */
  _findMatchingSource = function (associateEventSummary) {
    var matchingSource = null,
        referenceEventCodes,
        associateEventCodes;

    // TODO, check event codes to see if an event from the same source is preventing association
    referenceEventCodes = _referenceEvent.eventCodes;
    associateEventCodes = associateEventSummary.eventCodes;

    for (var key in associateEventCodes) {
      if (key in referenceEventCodes) {
        matchingSource = key;
      }
    }

    return matchingSource;
  };


  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = Util.compose(function () {

    // methods
    _findMatchingSource = null;
    _generateAssociateProducts = null;
    _getContent = null;
    _onCancel = null;
    _onConfirm = null;

    // variables
    if (_dialog !== null) {
      _dialog.destroy();
      _dialog = null;
    }
    _associateEvent = null;
    _associateEventId = null;
    _associateProducts = null;
    _detailsUrl = null;
    _infoEl = null;
    _referenceEvent = null;
  }, _this.destroy);

  _initialize();
  return _this;
};

module.exports = AssociateEventView;
