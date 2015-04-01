'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ProductHistoryView = require('admin/ProductHistoryView'),
    SendProductView = require('admin/SendProductView'),
    SummaryDetailsPage = require('base/SummaryDetailsPage');


SummaryDetailsPage.prototype.getSummaryContent = function (products) {
  var product,
      summary;

  products = CatalogEvent.getWithoutSuperseded(products);

  for (var i = 0; i < products.length; i++) {
    product = products[i];
    summary = this.buildSummaryMarkup(product, (!i));
    if (i === 0 && this._options.markPreferred) {
      summary.classList.add('preferred');
    } else {
      summary.classList.add('non-preferred');
    }
    // append summary section
    this._content.appendChild(summary);
  }
};

SummaryDetailsPage.prototype.buildSummaryMarkup = function (product, preferred) {
  var div = document.createElement('div'),
      el,
      summaryMarkup;

  preferred = (typeof preferred === 'undefined' ? true : preferred);

  el = document.createElement('a');
  el.className = this._options.hash + '-summary summary';
  el.setAttribute('href', this._buildHash(product));

  summaryMarkup = this._getSummaryMarkup(product);
  // Add description content
  if (typeof summaryMarkup === 'object') {
    el.appendChild(summaryMarkup);
  } else {
    el.innerHTML = summaryMarkup;
  }

  // append summary markup
  div.appendChild(el);
  // add edit/delete/trump buttons
  div.appendChild(this._getButtons(product, preferred));

  return div;
};

SummaryDetailsPage.prototype._getButtons = function (product, preferred) {
  var buttons = document.createElement('div'),
      editButton = document.createElement('button'),
      deleteButton = document.createElement('button'),
      detailsButton = document.createElement('button'),
      trumpButton;


  editButton.innerHTML = 'Edit';
  editButton.addEventListener('click', this._editProduct.bind(this));

  deleteButton.innerHTML = 'Delete';
  deleteButton.addEventListener('click', this._deleteProduct.bind(this));

  detailsButton.innerHTML = 'View Details';
  detailsButton.addEventListener('click', this._viewProduct.bind(this));

  buttons.classList.add('button-group');
  buttons.classList.add('summary-actions');
  buttons.setAttribute('data-id', product.code);
  buttons.appendChild(editButton);
  buttons.appendChild(deleteButton);
  buttons.appendChild(detailsButton);

  if (!preferred) {
    trumpButton = document.createElement('button');
    trumpButton.innerHTML = 'Make Preferred';
    trumpButton.className = 'confirm';
    trumpButton.addEventListener('click', this._trumpProduct.bind(this));
    buttons.appendChild(trumpButton);
  }

  return buttons;
};

SummaryDetailsPage.prototype._deleteProduct = function (e) {
  var dataid = e.target.parentElement.getAttribute('data-id'),
      productTypes = this._options.productTypes,
      productType,
      product,
      properties,
      deleteProducts = [];

  for(var i = 0; i < productTypes.length; i++) {
    productType = productTypes[i];

    product = this._getProductFromDataId(dataid, productType);

    if (product) {
      properties = product.properties;

      // build array of delete products
      deleteProducts.push(
        Product({
          source: product.source,
          type: product.type,
          status: Product.STATUS_DELETE,
          code: product.code,
          properties: {
            eventSource: properties.eventsource,
            eventSourceCode: properties.eventsourcecode
          }
        })
      );
    }
  }

  console.log(deleteProducts);

  /* Eric is updating SendProductView to accept multiple products */
  //this._sendProduct(deleteProducts);
};

SummaryDetailsPage.prototype._editProduct = function (e) {
  console.log('edit product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._viewProduct = function (e) {
  var dataid = e.target.parentElement.getAttribute('data-id'),
      products = [],
      product = null,
      productTypes = this._options.productTypes;

  for (var i = 0; i < productTypes.length; i++) {
    product = this._getProductFromDataId(dataid, productTypes[i]);
    products.push({
      'source': product.source,
      'type': product.type,
      'code': product.code
    });
  }


  ProductHistoryView({
    'eventDetails': this._event,
    'products': products
  });
};

SummaryDetailsPage.prototype._trumpProduct = function (e) {
  console.log('trump product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._getProductFromDataId = function (dataid, type) {
  var products = [],
      product = null;

  products = CatalogEvent.getWithoutSuperseded(
      CatalogEvent.productMapToList(
      this._options.eventDetails.properties.products));

  for (var i =0; i < products.length; i++) {
    product = products[i];
    if (type === product.type && dataid === product.code) {
      return product;
    }
  }
};

SummaryDetailsPage.prototype._sendProduct = function (products) {
  // send product
  var sendProductView,
      productSent;

  sendProductView = SendProductView({
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

module.exports = SummaryDetailsPage;