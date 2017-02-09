/* global EventConfig, EventDetails */
'use strict';


var AddEditPage = require('admin/AddEditPage');


AddEditPage({
  el: document.querySelector('.eventadmin-addedit'),
  eventConfig: EventConfig,
  eventDetails: EventDetails
});
