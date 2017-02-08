'use strict';


var Util = require('util/Util'),
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
      // TODO :: Create layout containers
    ];

    // TODO :: Create sub-views for each UI component
  };


  /**
   * Frees resources associated with this instance.
   *
   */
  _this.destroy = Util.compose(function () {
    if (_this === null) {
      return;
    }

    _createViewSkeleton = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AddEditPage;
