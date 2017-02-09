/* global mocha */
'use strict';


mocha.setup('bdd');

// Add each test class here as they are implemented
require('./spec/AddEditPageTest');
require('./spec/ProductTest');
require('./spec/TextProductViewTest');
require('./spec/EditLinkViewTest');

if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  mocha.run();
}
