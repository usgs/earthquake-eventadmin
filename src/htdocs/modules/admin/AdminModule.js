'use strict';


var EventModule = require('base/EventModule'),
    Util = require('util/Util'),

    AdminSummaryPage = require('admin/AdminSummaryPage'),
    CreateProductPage = require('admin/CreateProductPage');


var DEFAULTS = {
  title: 'Admin',
  hash: 'admin',
  cssUrl: 'modules/admin/index.css',
  pages: [
    {
      factory: AdminSummaryPage,
      options: {
        title: 'Summary',
        hash: 'summary'
      },
      //Always include page.
      hasContent: function () {
        return true;
      }
    },
    {
      factory: CreateProductPage,
      options: {
        title: 'Create Product',
        hash: 'createproduct'
      },
      //Always include page.
      hasContent: function () {
        return true;
      }
    }
  ]
};


var AdminModule = function (options) {
  options = Util.extend({}, DEFAULTS, options || {});
  EventModule.call(this, Util.extend({}, DEFAULTS, options || {}));
};
AdminModule.prototype = Object.create(EventModule.prototype);


module.exports = AdminModule;
