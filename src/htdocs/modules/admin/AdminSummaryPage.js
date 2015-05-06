'use strict';

var EventsAssociatedView = require('admin/EventsAssociatedView'),
    EventsNearbyView = require('admin/EventsNearbyView'),
    EventModulePage = require('base/EventModulePage'),
    InvalidatorView = require('invalidator/InvalidatorView'),
    ModalView = require('mvc/ModalView'),
    Util = require('util/Util');


var AdminSummaryPage = function (options) {

  options = Util.extend({}, options || {});

  this._actions = null;
  this._eventConfig = options.eventConfig;

  EventModulePage.call(this, options);
};

AdminSummaryPage.prototype = Object.create(EventModulePage.prototype);

AdminSummaryPage.prototype._setContentMarkup = function () {
  var button,
      content = this._content;

  content.innerHTML =
      '<div class="actions">' +
        '<button class="invalidate">Invalidate Cache</button>' +
      '</div>' +
      '<div class="events-associated"></div>' +
      '<div class="events-nearby"></div>';

  button = content.querySelector('.invalidate');
  button._clickHandler = this._onInvalidateClick.bind(this);
  button.addEventListener('click', button._clickHandler);
  this._invalidateButton = button;

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

AdminSummaryPage.prototype.destroy = function () {
  var button;

  button = this._invalidateButton;
  button.removeEventListener('click', button._clickHandler);
  button._clickHandler = null;
  this._invalidateButton = null;

  this._eventsAssociated.destroy();
  this._eventsAssociated = null;

  this._eventsNearby.destroy();
  this._eventsNearby = null;

  EventModulePage.prototype.destroy.call(this);
};


module.exports = AdminSummaryPage;
