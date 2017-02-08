/* global EventConfig, EventDetails */
'use strict';


var AllProductsView = require('admin/AllProductsView');


AllProductsView({
  el: document.querySelector('.eventadmin-products'),
  eventConfig: EventConfig,
  eventDetails: EventDetails
});
