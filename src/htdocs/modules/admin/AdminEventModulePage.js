'use strict';

var EventModulePage = require('base/EventModulePage'),
    CatalogEvent = require('CatalogEvent'),
    SendProductView = require('./SendProductView');

EventModulePage.prototype.getPreferredSummaryMarkup = function (product, hash, name) {
  var preferredProductMarkup = document.createElement('section');

  this._options.module.getPage(hash, function (page) {
    var preferredLink,
        product,
        products,
        summary;

    products = CatalogEvent.removePhases(
          CatalogEvent.getWithoutSuperseded(page.getProducts()));
    product = products[0];
    summary = page.buildSummaryMarkup(product);
    if (product.status.toUpperCase() === 'DELETE') {
      summary.classList.add('deleted');
    }

    preferredProductMarkup.innerHTML = '<h3>' + name + '</h3>';
    preferredProductMarkup.appendChild(summary);

    // Add link to product-summary page when more than one product exists
    if (products.length > 1) {
      preferredLink = document.createElement('a');
      preferredLink.href = '#' + hash;
      preferredLink.className = 'view-all';
      preferredLink.innerHTML = 'View all ' + name + 's (' + products.length +
          ' total)';
      preferredProductMarkup.appendChild(preferredLink);
    }
  });

  this._content.appendChild(preferredProductMarkup);
};


EventModulePage.prototype._sendProduct = function (products, title, text) {
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


module.exports = EventModulePage;
