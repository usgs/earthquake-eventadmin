'use strict';


var ModalView = require('mvc/ModalView'),
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
   * Creates the scaffold for the this page along with sub-views for each
   * specific task.
   *
   */
  _createViewSkeleton = function () {
    _this.el.innerHTML = [
      /* eslint-disable indent */
      '<ul class="addeditpage_pins no-style">',
        // Create a pin item for each ...
        _this.createPinItem('add-widget', 'Widget Product',
            'Use this feature to add a widget product to the page. ' +
            'This is meant as an example for development purposes only.'),
      '</ul>'
      /* eslint-enable indent */
    ].join('');

    // Create sub-views for each UI component, note the selector
    // matches the className from the createPinItem function call
    _this.addWidgetButton = _this.el.querySelector('.add-widget button');
    _this.addWidgetButton.addEventListener('click', _this.onAddWidgetClick);
  };


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
    _this.addWidgetButton.removeEventListener('click', _this.onAddWidgetClick);

    // Set all member variables to null
    _this.addWidgetButton = null;

    // Set all private functions to null
    _createViewSkeleton = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.onAddWidgetClick = function (/*evt*/) {
    ModalView('<p class="alert info">You&rsquo;re Awesome!</p>', {
      title: 'Add Widget Product Interface',
      buttons: [
        {
          text: 'Done',
          callback: function (evt, dialog) {
            dialog.hide();
          }
        }
      ]
    }).show();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AddEditPage;
