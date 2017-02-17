'use strict';


var EditLinkView = require('admin/EditLinkView'),
    Product = require('admin/Product'),
    TextProductView = require('admin/TextProductView'),
    Util = require('util/Util'),
    View = require('mvc/View');



var _DEFAULTS;

_DEFAULTS = {
  eventConfig: {},
  eventDetails: {}
};


/**
 * This is the top-level class for the "Add/Edit Content" page in the event
 * admin interface. This page provides user-friendly UI for performing
 * common tasks including but not limited to adding/editing:
 *
 * - Tectonic Summaries
 * - Event Headers
 * - External Links (news articles etc...)
 */
var AddEditPage = function (options) {
  var _this,
      _initialize,

      _createViewSkeleton;


  _this = View(options);

  /**
   * Constructor.
   *
   * @param options {Object}
   *     Configuration options for this page. Specifically...
   * @param options.eventConfig {Object}
   *     Options specific to the installation
   * @param options.eventDetails {Object}
   *     Detailed information about the current event
   */
  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _this._eventConfig = options.eventConfig;
    _this._eventDetails = options.eventDetails;

    _createViewSkeleton();
  };


  /**
   * Create the skeleton scaffold for this page. This page includes "pin" items
   * for each action to be taken (adding/editing specific products/content).
   * This function should create each pin item and bind event handlers to the
   * corresponding buttons in order to open the dialog to accomplish a specific
   * task and/or add/edit products/content.
   *
   */
  _createViewSkeleton = function () {
    _this.el.innerHTML = [
      /* eslint-disable indent */
      '<ul class="addeditpage_pins no-style">',
        // General Header pin
        _this.createPinItem('add-header', 'General Header',
            'Use this feature to add a header that will be displayed ' +
            'above all content on the event page.'),
        // Add Link pin
        _this.createPinItem('add-link', 'Add Link',
            'Use this feature to add a link near the bottom of the event ' +
            'page. Links can be to any web-addressable content such as news ' +
            'articles, images, or videos.'),
      '</ul>'
      /* eslint-enable indent */
    ].join('');

    _this.addLinkButton = _this.el.querySelector('.add-link button');
    _this.addLinkButton.addEventListener('click', _this.onAddLinkClick);

    // Create general-header modal binding
    _this.addGeneralHeaderButton = _this.el.querySelector('.add-header button');
    _this.addGeneralHeaderButton.addEventListener('click', _this.onAddGeneralHeader);
  };


  /**
   * Create markup for a new pin item to display.
   *
   * @param className {String}
   *     The class name to add to the pin item container. This class should
   *     subsequently be used to scope a selector to get the button element
   *     in order to bind an event handler to it.
   * @param title {String}
   *     The pin title for this item. Appears at the top of the pin.
   * @param content {String}
   *     The pin description for this item. Appears in the content area of the
   *     pin.
   *
   * @return {String}
   *     Markup for a pin item. Markup should be appened to a list
   *     (<ul> or <ol>) container as the top-level element in the returned
   *     markup is a list item.
   */
  _this.createPinItem = function (className, title, content) {
    return [
      /* eslint-disable indent */
      '<li class="addeditpage_pin ', className, '">',
        '<article class="addeditpage_pin-wrapper">',
          '<header class="addeditpage_pin-header">', title, '</header>',
          '<section class="addeditpage_pin-content">', content, '</section>',
          '<footer class="addeditpage_pin-footer">',
            '<button class="addeditpage_pin-action">Add</button>',
          '</footer>',
        '</article>',
      '</li>'
      /* eslint-enable indent */
    ].join('');
  };

  /**
   * Frees resources associated with this instance.
   *
   */
  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return;
    }

    // Unbind all click handlers
    _this.addLinkButton.removeEventListener('click', _this.onAddLinkClick);
    _this.addGeneralHeaderButton.removeEventListener('click', _this.onAddGeneralHeader);

    // Set all member variables to null
    _this.addLinkButton = null;
    _this.addGeneralHeaderButton = null;

    // Set all private functions to null
    _createViewSkeleton = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  /**
   * Callback function executed when the user clicks the "Add" button on the
   * "Add Link Product" pin. This callback shows a dialog for creating a
   * new general-link product for the current event.
   *
   */
  _this.onAddLinkClick = function () {
    var eventDetails,
        properties;

    eventDetails = _this._eventDetails;

    if (eventDetails) {
      properties = eventDetails.properties;

      EditLinkView({
        'type': 'general-link',
        'source': 'admin',
        'code': eventDetails.id + '-' + new Date().getTime(),
        'eventSource': properties.net,
        'eventSourceCode': properties.code
      }).show();
    }
  };

  _this.onAddGeneralHeader = function () {
    var eventDetails,
        header,
        properties,
        product,
        products;


    eventDetails = _this._eventDetails;
    properties = eventDetails.properties;
    products = properties.products;

    if (products && products['general-header']) {
      header = properties.products['general-header'][0];
    }

    if (header) {
      // request tectonic summary and create modal to edit
      product = new Product(header);
      TextProductView({
        product: product,
        modalTitle: 'General Header'
      }).show();
    } else {
      TextProductView({
        type: 'general-header',
        source: 'admin',
        code: eventDetails.id + '-' + new Date().getTime(),
        eventSource: properties.net,
        eventSourceCode: properties.code,
        modalTitle: 'General Header'
      }).show();
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AddEditPage;
