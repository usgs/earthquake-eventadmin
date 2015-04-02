/* global mocha */
'use strict';


mocha.setup('bdd');

// Add each test class here as they are implemented
require('./spec/FirstTest');
require('./spec/TextProductViewTest');

if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  mocha.run();
}
