/* global EventAdminConfig */
'use strict';

var EventAdminView = require('./EventAdminView');


EventAdminView({
  el: document.querySelector('.eventadmin'),
  config: EventAdminConfig
});
