'use strict';


var TextProductView = require('admin/TextProductView'),
    EventSummaryPage = require('summary/SummaryPage');


var __type_to_display = function (type) {
  var tokens = type.split('-'),
      buffer = [];

  tokens.forEach(function (token) {
    buffer.push(token[0].toUpperCase() + token.slice(1));
  });

  return buffer.join(' ');
};


var SummaryPage = function (options) {
  this._addTextProductButtons = [];
  this._onAddTextProductClick = this._onAddTextProductClick.bind(this);

  EventSummaryPage.call(this, options);
};
SummaryPage.prototype = Object.create(EventSummaryPage.prototype);


/**
 * Override parent method to always return content markup for text-type
 * products regardless of if any such product exists yet.
 *
 * @see earthquake-eventpages::summary/SummaryPage#_getTextContentMarkup
 */
SummaryPage.prototype._getTextContentMarkup = function (type) {
  return '<div class="summary-' + type + '"></div>';
};

/**
 * Override parent method to first do whatever the parent might have done, but
 * then also inject a button to add another textual content product.
 *
 *
 * @see earthquake-eventpages::summary/SummaryPage#_loadTextualContent
 */
 SummaryPage.prototype._loadTextualContent = function (container, type, title) {
  var button,
      buttonTitle;

  buttonTitle = title ? title : __type_to_display(type);

  // First call parent method
  EventSummaryPage.prototype._loadTextualContent.call(
      this, container, type, title);

  // Create a button to add another
  button = document.createElement('button');
  button.classList.add('green');
  button.classList.add('create-text-button');
  button.setAttribute('product-type', type);
  button.innerHTML = 'Create ' + buttonTitle;

  button.addEventListener('click',
      this._onAddTextProductClick);

  // If untitled, add the title for the section
  if (container.innerHTML === '') {
    container.innerHTML = '<p class="no-product-warning warning">No &ldquo;' +
        buttonTitle + '&rdquo; (' + type + ') products exist yet. If/when ' +
        'such a product is created, it will appear here.</p>';

    container.querySelector('.warning').appendChild(button);
  } else {
    container.appendChild(button);
  }

  this._addTextProductButtons.push(button);
};

/**
 * Override parent method to additionally clean up resources/references added
 * by this subclass.
 *
 * @see earthquake-eventpages::summary/SummaryPage#destroy
 */
SummaryPage.prototype.destroy = function () {
  EventSummaryPage.prototype.destory.apply(this);

  this._addTextProductButtons.forEach(function (button) {
    button.removeEventListener('click', this._onAddTextProductClick);
  }, this);
};

/**
 * Called when the button to add a new general text product is clicked.
 *
 */
SummaryPage.prototype._onAddTextProductClick = function (evt) {
  var button = evt.target;

  TextProductView({
    type: button.getAttribute('product-type'),
    source: 'admin',
    code: this._event.id + '-' + (new Date()).getTime(),
    eventSource: this._event.properties.net,
    eventSourceCode: this._event.properties.code,
    modalTitle: button.innerHTML
  }).show();
};


module.exports = SummaryPage;
