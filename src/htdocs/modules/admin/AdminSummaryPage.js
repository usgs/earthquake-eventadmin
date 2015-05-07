'use strict';

var CatalogEvent = require('CatalogEvent'),
    EventsAssociatedView = require('admin/EventsAssociatedView'),
    EventsNearbyView = require('admin/EventsNearbyView'),
    EventModulePage = require('admin/AdminEventModulePage'),
    InvalidatorView = require('invalidator/InvalidatorView'),
    ModalView = require('mvc/ModalView'),
    ProductFactory = require('admin/ProductFactory'),
    Util = require('util/Util');


var AdminSummaryPage = function (options) {

  options = Util.extend({}, options || {});

  this._buttons = [];
  this._eventConfig = options.eventConfig;
  this._productFactory = options.productFactory || ProductFactory();

  EventModulePage.call(this, options);
};

AdminSummaryPage.prototype = Object.create(EventModulePage.prototype);

AdminSummaryPage.prototype._setContentMarkup = function () {
  var button,
      content = this._content;

  content.innerHTML =
      '<div class="actions">' +
        '<button class="viewevent">View Event Page</button>' +
        '<button class="invalidate">Invalidate Cache</button>' +
        '<button class="deleteevent">Delete Event</button>' +
      '</div>' +
      '<div class="events-associated"></div>' +
      '<div class="events-nearby"></div>';

  button = content.querySelector('.invalidate');
  button._clickHandler = this._onInvalidateClick.bind(this);
  button.addEventListener('click', button._clickHandler);
  this._buttons.push(button);

  button = content.querySelector('.viewevent');
  button._clickHandler = this._onViewEventClick.bind(this);
  button.addEventListener('click', button._clickHandler);
  this._buttons.push(button);

  button = content.querySelector('.deleteevent');
  button._clickHandler = this._onDeleteEventClick.bind(this);
  button.addEventListener('click', button._clickHandler);
  this._buttons.push(button);

  this._eventsAssociated = EventsAssociatedView({
    el: content.querySelector('.events-associated'),
    eventDetails: this._event
  });

  this._eventsNearby = EventsNearbyView({
    el: content.querySelector('.events-nearby'),
    eventDetails: this._event,
    eventConfig: this._eventConfig
  });

};

/**
 * Delete Event button click handler.
 */
AdminSummaryPage.prototype._onDeleteEventClick = function () {
  var products;

  if (!this._event.properties.products.origin) {
    return;
  }

  // origin products, TODO: other products too?
  products = CatalogEvent.getWithoutDeleted(
      CatalogEvent.getWithoutSuperseded(
        this._event.properties.products.origin));
  // create delete products
  products = products.map(this._productFactory.getDelete);
  // send products
  this._sendProduct(products, 'Delete Event',
      '<h4>The following products will be deleted</h4>');
};

/**
 * Invalidate Cache button click handler.
 */
AdminSummaryPage.prototype._onInvalidateClick = function () {
  var eventid = this._event.id,
      paths,
      view,
      modal;

  paths = [];
  paths.push('/earthquakes/eventpage/' + eventid);
  paths.push('/earthquakes/feed/v1.0/detail/' + eventid + '.geojson');
  paths.push('/fdsnws/event/1/query?eventid=' + eventid + '&format=geojson');

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

/**
 * View Event button click handler.
 */
AdminSummaryPage.prototype._onViewEventClick = function () {
  var url = 'http://' + this._eventConfig.OFFSITE_HOST +
      '/earthquakes/eventpage/' +
      this._event.id;
  window.open(url);
};

AdminSummaryPage.prototype.destroy = function () {
  this._buttons.forEach(function (button) {
    button.removeEventListener('click', button._clickHandler);
    button._clickHandler = null;
  });
  this._buttons = null;

  this._eventsAssociated.destroy();
  this._eventsAssociated = null;

  this._eventsNearby.destroy();
  this._eventsNearby = null;

  EventModulePage.prototype.destroy.call(this);
};


module.exports = AdminSummaryPage;
