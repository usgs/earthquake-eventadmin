/* global CONFIG */
'use strict';


var ChooseEventView = require('admin/ChooseEventView');


var config;

config = JSON.parse(JSON.stringify(CONFIG));
config.el = document.querySelector('.eventadmin');


ChooseEventView(config);
