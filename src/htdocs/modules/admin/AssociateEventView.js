'use strict';

var CatalogEvent = require('CatalogEvent'),
    Collection = require('mvc/Collection'),
    Product = require('Product'),
    ProductContent = require('ProductContent'),
    SendProductView = require('admin/SendProductView'),

    ModalView = require('mvc/ModalView'),
    View = require('mvc/View'),

    Util = require('util/Util'),
    Xhr = require('util/Xhr');

var DEFAULTS = {
  SEARCH_STUB: 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson'
};

var AssociateEventView = function (options) {
  var _this,
      _initialize,

      // variables
      _associateEvent,
      _associateEventId,
      _associateProducts = [],
      _associateProductText,
      _dialog,
      _infoEl,
      _referenceEvent,
      _searchStub,

      // methods
      _appendAssociationText,
      _createSendProductView,
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
    _searchStub = options.eventConfig.SEARCH_STUB || options.SEARCH_STUB;

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

  /**
   * Confirm button callback for modal dialog
   */
  _onConfirm = function () {
    _appendAssociationText();
    _createSendProductView();
  };

  /**
   * Cancel button callback for modal dialog
   */
  _onCancel = function () {
    _dialog.hide();
  };

  /**
   * Request the event detail feed for the event to be associated, and
   * manage the association logic required to create an association between
   * the two events
   */
  _getContent = function () {
    Xhr.ajax({
      url: _searchStub + '&eventid=' + _associateEventId,
      success: function (data) {
        var associateEvent = CatalogEvent(data).getSummary(),
            matchingEventSource = _findMatchingSource(associateEvent);

        // check if there is a matching event source
        if (matchingEventSource !== null) {
          _associateProductText = 'multiple event ids from same source';
          // build an associate product for each id with the matching source
          _associateProducts = _generateAssociateProducts(matchingEventSource, associateEvent);
        } else {
          _associateProductText = 'outside automatic association window';
          // associate using the preferred eventsource and eventsourcecode
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

        // textarea where the user can update the inline text product content
        _infoEl.classList.add('vertical');
        _infoEl.innerHTML =
            '<label for="associate-reason">' +
              'Associate Reason' +
            '</label>' +
            '<textarea id="associate-reason" class="textproduct-text">' +
              _associateProductText +
            '</textarea>';
      },
      error: function () {
        _infoEl.innerHTML = '<p class="alert error">Unable to request ' +
            'detail feed for event: ' + _associateEventId + '</p>';
      }
    });
  };

  /**
   * Adds association logic text as inline product content from
   * the textarea input
   */
  _appendAssociationText = function () {
    var text = _infoEl.querySelector('.textproduct-text').value;

    for (var i = 0; i < _associateProducts.length; i++) {
      _associateProducts[i].set({
        'contents': Collection([
          ProductContent({
            'id': '',
            'bytes': text,
            'length': text.length
          })
        ])
      });
    }
  };

  /**
   * Display associate products in SendProductView
   */
  _createSendProductView = function () {
    var sendProductView = SendProductView({
      modalTitle: 'Associate Product(s)',
      products: _associateProducts,
      formatProduct: function (products) {
        // format product being sent
        return sendProductView.formatProduct(products);
      }
    });
    sendProductView.show();
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
    _infoEl = null;
    _referenceEvent = null;
    _searchStub = null;
  }, _this.destroy);

  _initialize();
  return _this;
};

module.exports = AssociateEventView;
