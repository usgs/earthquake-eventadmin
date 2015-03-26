'use strict';

var AssociatedEventView = require('admin/AssociatedEventView'),
    EventModulePage = require('base/EventModulePage'),
    NearbyEventView = require('NearbyEventView'),
    Util = require('util/Util');


var AdminSummaryPage = function (options) {
  options = Util.extend({}, options || {});

  EventModulePage.call(this, options);
};

AdminSummaryPage.prototype = Object.create(EventModulePage.prototype);

AdminSummaryPage.prototype._setContentMarkup = function () {

  AssociatedEventView({
    el: this._content,
    eventDetails: this._event
  });

  NearbyEventView({
    el: this._content,
    eventDetails: this._event
  });

};


module.exports = AdminSummaryPage;
