'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ProductHistoryView = require('admin/ProductHistoryView'),
    SendProductView = require('admin/SendProductView'),
    SummaryDetailsPage = require('base/SummaryDetailsPage');


SummaryDetailsPage.prototype._setContentMarkup = function () {
  var products = this.getProducts();

  products = CatalogEvent.removePhases(
      CatalogEvent.getWithoutSuperseded(products));

  this._products = products;

  if (products.length === 1) {
    // If there is only one product display details
    this._content.appendChild(this.getDetailsContent(products[0]));
    this._content.insertBefore(this._getButtons(products[0]), this._content.firstChild);
  } else {
    // there is more than one product display summary
    this._content.appendChild(this.getSummaryContent(products));
  }
};


SummaryDetailsPage.prototype.getSummaryContent = function (products) {
  var summary,
      product,
      fragment = document.createDocumentFragment();

  for (var i = 0; i < products.length; i++) {
    product = products[i];
    summary = this.buildSummaryMarkup(product, !i);
    // append summary markup
    fragment.appendChild(summary);
    // add edit/delete/trump buttons
    fragment.appendChild(this._getButtons(product, i));

    if (i === 0 && this._options.markPreferred) {
      summary.classList.add('preferred');
    }
  }
  return fragment;
};

SummaryDetailsPage.prototype._getButtons = function (product, dataid) {
  var buttons = document.createElement('div'),
      editButton,
      deleteButton,
      detailsButton,
      trumpButton;

  editButton = document.createElement('button');
  editButton.innerHTML = 'Edit Product';
  editButton.addEventListener('click', this._editProduct.bind(this));

  detailsButton = document.createElement('button');
  detailsButton.innerHTML = 'View Revisions';
  detailsButton.addEventListener('click', this._viewProduct.bind(this));

  deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete Product';
  deleteButton.addEventListener('click', this._deleteProduct.bind(this));

  trumpButton = document.createElement('button');
  trumpButton.innerHTML = 'Trump Preferred';
  trumpButton.addEventListener('click', this._trumpProduct.bind(this));

  // preserve this order
  buttons.appendChild(detailsButton);
  buttons.appendChild(editButton);
  buttons.appendChild(trumpButton);
  buttons.appendChild(deleteButton);

  buttons.classList.add('button-group');
  buttons.classList.add('summary-actions');
  buttons.setAttribute('data-id', dataid);

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

  this._sendProduct(deleteProducts);
};

SummaryDetailsPage.prototype._editProduct = function (e) {
  console.log('edit product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._viewProduct = function (e) {
  var dataid = e.currentTarget.parentElement.getAttribute('data-id');

  ProductHistoryView({
    'eventDetails': this._event,
    'product': this._products[dataid],
    'page': this
  });
};

SummaryDetailsPage.prototype._trumpProduct = function (e) {
  var dataid = e.target.parentElement.getAttribute('data-id'),
      productTypes = this._options.productTypes,
      productType,
      product,
      properties,
      trumpProducts = [];

  for(var i = 0; i < productTypes.length; i++) {
    productType = productTypes[i];

    product = this._getProductFromDataId(dataid, productType);

    if (product) {
      properties = product.properties;

      // build array of delete products
      trumpProducts.push(
        Product({
          source: product.source,
          type: 'trump-' + product.type,
          status: Product.STATUS_DELETE,
          code: product.code,
          properties: {
            'eventSource': properties.eventsource,
            'eventSourceCode': properties.eventsourcecode,
            'trump-source': product.source,
            'trump-code': product.code
          }
        })
      );
    }
  }

  // Send Trump
  this._sendProduct(trumpProducts);
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

  return null;
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