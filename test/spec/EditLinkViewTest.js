/* global chai, describe, it */
'use strict';

// var Product = require('Product'),
//     ProductContent = require('PrductContent'),

var  EditLinkView = require('admin/EditLinkView');


var expect = chai.expect;

describe('EditLinkViewTest', function () {
  describe('Shows / Hides modal view', function () {

    it('is visible', function () {
      var editLinkView = EditLinkView({

      });

      editLinkView.show();

      /* jshint -W030 */
      expect(document.querySelector('#linkText')).to.not.be.null;
      /* jshint +W030 */

    });

  });

});
