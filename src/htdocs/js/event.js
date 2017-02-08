/* global EventConfig, EventDetails */
'use strict';


var AdminSummaryPage = require('admin/AdminSummaryPage');


AdminSummaryPage({
  el: document.querySelector('.eventadmin-event'),
  eventConfig: EventConfig,
  eventDetails: EventDetails
});
