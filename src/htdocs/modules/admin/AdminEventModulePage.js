'use strict';

var EventModulePage = require('base/EventModulePage'),
    CatalogEvent = require('CatalogEvent');

EventModulePage.prototype.getPreferredSummaryMarkup = function (product, hash, name) {
  var preferredProductMarkup = document.createElement('section');

  this._options.module.getPage(hash, function (page) {
    var products = CatalogEvent.removePhases(
          CatalogEvent.getWithoutSuperseded(
          page.getProducts())),
        preferredLink = document.createElement('a');

    preferredProductMarkup.innerHTML = '<h3>' + name + '</h3>';
    preferredProductMarkup.appendChild(page.buildSummaryMarkup(product));

    // Add link to product-summary page when more than one product exists
    if (products.length > 1) {
      preferredLink.href = '#' + hash;
      preferredLink.className = 'view-all';
      preferredLink.innerHTML = 'View all ' + name + 's (' + products.length +
          ' total)';
      preferredProductMarkup.appendChild(preferredLink);
    }
  });

  this._content.appendChild(preferredProductMarkup);
};


module.exports = EventModulePage;
