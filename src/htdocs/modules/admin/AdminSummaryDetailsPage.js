'use strict';

var SummaryDetailsPage = require('base/SummaryDetailsPage'),
    CatalogEvent = require('CatalogEvent');


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
    trumpButton.addEventListener('click', this._trumpProduct.bind(this));
    buttons.appendChild(trumpButton);
  }

  return buttons;
};

SummaryDetailsPage.prototype._deleteProduct = function (e) {
  console.log('delete product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._editProduct = function (e) {
  console.log('edit product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._viewProduct = function (e) {
  console.log('view product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._trumpProduct = function (e) {
  console.log('trump product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

// SummaryDetailsPage.prototype._getProductFromProductId = function (productid) {
//   var products = CatalogEvent.getWithoutSuperseded(this._options.eventDetails);
//   // TODO, loop through products to find product
// }

module.exports = SummaryDetailsPage;