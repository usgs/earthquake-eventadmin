'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ProductHistoryView = require('admin/ProductHistoryView'),
    SendProductView = require('admin/SendProductView'),
    SummaryDetailsPage = require('base/SummaryDetailsPage');


SummaryDetailsPage.prototype._setContentMarkup = function () {
  var products = this._products = this.getProducts();

  products = CatalogEvent.removePhases(
      CatalogEvent.getWithoutSuperseded(products));

  if (products.length === 1) {
    // If there is only one product display details
    this.getDetailsContent(products[0]);
    this._content.insertBefore(this._getButtons(products[0]), this._content.firstChild);
  } else {
    // there is more than one product display summary
    this._content.appendChild(this.getSummaryContent(products));
  }
};


SummaryDetailsPage.prototype.getSummaryContent = function (products) {
  var product,
      fragment = document.createDocumentFragment();

  for (var i = 0; i < products.length; i++) {
    product = products[i];
    fragment.appendChild(this.buildSummaryMarkup(products[i], !i));
  }
  return fragment;
};


SummaryDetailsPage.prototype.buildSummaryMarkup = function (product, preferred) {
  var fragment = document.createDocumentFragment(),
      el,
      summaryMarkup;

  if (this._options.viewUp === true) {
    el = document.createElement('div');
  } else {
    el = document.createElement('a');
  }

  el.className = this._options.hash + '-summary summary';
  el.setAttribute('href', this._buildHash(product));


  if (this._options.viewUp !== true && preferred === true &&
      this._options.markPreferred) {
    el.classList.add('preferred');
  }

  if (this._options.viewUp === true && preferred !== true) {
    el.classList.add('superseded');
  }

  summaryMarkup = this._getSummaryMarkup(product);
  // Add description content
  if (typeof summaryMarkup === 'object') {
    el.appendChild(summaryMarkup);
  } else {
    el.innerHTML = summaryMarkup;
  }

  // append summary markup
  fragment.appendChild(el);
  // add edit/delete/trump buttons
  fragment.appendChild(this._getButtons(product));

  return fragment;
};

SummaryDetailsPage.prototype._getButtons = function (product) {
  var buttons = document.createElement('div'),
      editButton = document.createElement('button'),
      deleteButton = document.createElement('button'),
      detailsButton = document.createElement('button'),
      trumpButton;


  editButton.innerHTML = 'Edit Product';
  editButton.addEventListener('click', this._editProduct.bind(this));

  deleteButton.innerHTML = 'Delete Product';
  deleteButton.addEventListener('click', this._deleteProduct.bind(this));

  if (this._options.viewUp !== true) {
    detailsButton.innerHTML = 'View Revisions';
    detailsButton.addEventListener('click', this._viewProduct.bind(this));
    buttons.appendChild(detailsButton);
  }

  trumpButton = document.createElement('button');
  trumpButton.innerHTML = 'Trump Preferred';
  trumpButton.addEventListener('click', this._trumpProduct.bind(this));

  buttons.classList.add('button-group');
  buttons.classList.add('summary-actions');
  buttons.setAttribute('data-id', product.code);
  buttons.appendChild(editButton);
  buttons.appendChild(trumpButton); 
  buttons.appendChild(deleteButton);

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
  var dataid = e.target.parentElement.getAttribute('data-id'),
      products = [],
      product = null,
      productTypes = this._options.productTypes;

  for (var i = 0; i < productTypes.length; i++) {
    product = this._getProductFromDataId(dataid, productTypes[i]);
    products.push(product);
  }

  this._options.viewUp = true;

  ProductHistoryView({
    'eventDetails': this._event,
    'products': products,
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