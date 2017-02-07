/* global EventConfig, EventDetails */
'use strict';


var AllProductsView = require('AllProductsView');


AllProductsView({
  el: document.querySelector('.eventadmin-products'),
  eventConfig: EventConfig,
  eventDetails: EventDetails
});
