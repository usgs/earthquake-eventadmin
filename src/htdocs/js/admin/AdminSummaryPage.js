'use strict';


var CatalogEvent = require('admin/CatalogEvent'),
    EventsAssociatedView = require('admin/EventsAssociatedView'),
    EventsNearbyView = require('admin/EventsNearbyView'),
    InvalidatorView = require('invalidator/InvalidatorView'),
    ModalView = require('mvc/ModalView'),
    ProductFactory = require('admin/ProductFactory'),
    SendProductView = require('admin/SendProductView'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS;

_DEFAULTS = {
};


var AdminSummaryPage = function (options) {
  var _this,
      _initialize,

      _createViewSkeleton;


  _this = View(options);

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _this._buttons = [];
    _this._eventConfig = options.eventConfig;
    _this._event = options.eventDetails;
    _this._productFactory = options.productFactory || ProductFactory();

    _createViewSkeleton();
  };


  _createViewSkeleton = function () {
    var button;

    _this.el.innerHTML =
        '<div class="actions">' +
          //'<button class="invalidate">Invalidate Cache</button>' +
          '<button class="deleteevent red">Delete Event</button>' +
        '</div>' +
        '<div class="events-associated"></div>' +
        '<div class="events-nearby"></div>';

    // Invalidate button will be used at a later date
    //button = _this.el.querySelector('.invalidate');
    //button._clickHandler = _this._onInvalidateClick.bind(_this);
    //button.addEventListener('click', button._clickHandler);
    //_this._buttons.push(button);

    button = _this.el.querySelector('.deleteevent');
    button._clickHandler = _this._onDeleteEventClick.bind(_this);
    button.addEventListener('click', button._clickHandler);
    _this._buttons.push(button);

    _this._eventsAssociated = EventsAssociatedView({
      el: _this.el.querySelector('.events-associated'),
      eventDetails: _this._event
    });

    _this._eventsNearby = EventsNearbyView({
      el: _this.el.querySelector('.events-nearby'),
      eventDetails: _this._event,
      eventConfig: _this._eventConfig
    });
  };


  _this._onContinueClick = function (products) {
    // origin products, TODO: other products too?
    products = CatalogEvent.getWithoutDeleted(
        CatalogEvent.getWithoutSuperseded(
          _this._event.properties.products.origin));
    // create delete products
    products = products.map(_this._productFactory.getDelete);
    // send products
    _this._sendProduct(products, 'Delete Event',
        '<h4>The following products will be deleted</h4>');
  };

  /**
   * Delete Event button click handler.
   */
  _this._onDeleteEventClick = function () {
    var products;

    if (!_this._event.properties.products.origin) {
      return;
    }

    /* eslint-disable */
    ModalView('<p class="alert warning">If this event is real, associate ' +
        'this event, do not delete.</p>', {
      title: 'Delete Event Warning',
      buttons: [
        {
          text: 'Continue',
          callback: function (evt, dialog) {
            dialog.hide();
            _this._onContinueClick(products);
          }
        },
        {
          text: 'Cancel',
          callback: function (evt, dialog) {
            dialog.hide();
          }
        }
      ]
    }).show();
    /* eslint-enable */
  };

  /**
   * Invalidate Cache button click handler.
   */
  _this._onInvalidateClick = function () {
    var eventid = _this._event.id,
        paths,
        view,
        modal;

    paths = [];
    paths.push('/earthquakes/eventpage/' + eventid);
    paths.push('/earthquakes/feed/v1.0/detail/' + eventid + '.geojson');
    paths.push('/fdsnws/event/1/query?eventid=' + eventid + '&format=geojson');
    paths.push(_this._eventConfig.SEARCH_PATH);

    view = InvalidatorView({
      paths: paths
    });

    modal = ModalView(view.el, {
      closable: true,
      title: 'Invalidate Cache'
    });

    modal.on('hide', function () {
      view.destroy();
      modal.destroy();
    });

    modal.show();
  };

  _this._sendProduct = function (products, title, text) {
    // send product
    var sendProductView,
        productSent;

    sendProductView = SendProductView({
      modalTitle: title,
      modalText: text,
      products: products,
      formatProduct: function (products) {
        // format product being sent
        return sendProductView.formatProduct(products);
      }
    });

    sendProductView.on('success', function () {
      // track that product was sent
      productSent = true;
    });

    sendProductView.on('cancel', function () {
      if (productSent) {
        // product was sent, which will modify the event
        // reload page to see update
        window.location.reload();
      } else {
        // product not sent, cleanup
        products = null;
        sendProductView.destroy();
        sendProductView = null;
      }
    });

    sendProductView.show();
  };


  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return;
    }

    _this._buttons.forEach(function (button) {
      button.removeEventListener('click', button._clickHandler);
      button._clickHandler = null;
    });
    _this._buttons = null;

    _this._eventsAssociated.destroy();
    _this._eventsAssociated = null;

    _this._eventsNearby.destroy();
    _this._eventsNearby = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AdminSummaryPage;
