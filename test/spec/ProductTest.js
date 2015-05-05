/* global chai, describe, it */
'use strict';

var Product = require('Product'),
    ProductContent = require('ProductContent'),

    Collection = require('mvc/Collection');

var expect = chai.expect;


describe('Product', function () {
  describe('Constructor', function () {

    var validateProduct = function (product) {
      var inlineContent;

      expect(product.get('contents')).to.respondTo('get'); // Is a Collection

      inlineContent = product.get('contents').get('');

      /* jshint -W030 */
      expect(inlineContent).not.to.be.undefined;
      expect(inlineContent).not.to.be.null;
      /* jshint +W030 */
    };

    it('can be created and destroyed', function () {
      var createAndDestroy = function () {
        var product = Product();
        product.destroy();
      };

      expect(createAndDestroy).not.to.throw(Error);
    });

    it('coerces an array of objects', function () {
      var coerceArrayOfObjects,
          product;

      coerceArrayOfObjects = function () {
        product = Product({
          contents: [
            {bytes: '', id: ''}
          ]
        });
      };

      expect(coerceArrayOfObjects).not.to.throw(Error);


      coerceArrayOfObjects();
      validateProduct(product);
      product.destroy();
    });

    it('coerces and array of ProductContent', function () {
      var coerceArrayOfContent,
          product;

      coerceArrayOfContent = function () {
        product = Product({
          contents: [
            ProductContent({bytes: '', id: ''})
          ]
        });
      };

      expect(coerceArrayOfContent).not.to.throw(Error);


      coerceArrayOfContent();
      validateProduct(product);
      product.destroy();
    });

    it('does not change a Collection of ProductContent', function () {
      var contents,
          noTouch,
          product;

      contents = Collection([ProductContent({bytes: '', id: ''})]);

      noTouch = function () {
        product = Product({contents: contents});
      };

      expect(noTouch).not.to.throw(Error);

      noTouch();
      validateProduct(product);
      expect(product.get('contents')).to.equal(contents);
      product.destroy();
    });
  });
});
