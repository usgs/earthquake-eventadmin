'use strict';

var EventModulePage = require('base/EventModulePage'),
    Util = require('util/Util');


var AdminSummaryPage = function (options) {
  options = Util.extend({}, options || {});

  EventModulePage.call(this, options);
};
AdminSummaryPage.prototype = Object.create(EventModulePage.prototype);


AdminSummaryPage.prototype._setContentMarkup = function () {
  var products = this._event.properties.products;

  this._content.innerHTML = JSON.stringify(products);
};


module.exports = AdminSummaryPage;
