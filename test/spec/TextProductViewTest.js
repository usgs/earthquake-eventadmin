/* global chai, describe, it */
'use strict';

var Product = require('admin/Product'),

    TextProductView = require('admin/TextProductView');

var expect = chai.expect;

describe('TextProductView', function () {
  describe('Constructor', function () {

    it('Throws exceptions if used incorrectly', function () {
      expect(TextProductView).to.throw(Error);
    });

    it('Instantiates without error with a product', function () {
      var textProductView = TextProductView({
        product: Product({
          type: 'testType',
          source: 'testSource',
          code: 'testCode',
          properties: {
            eventSource: 'testEventSource',
            eventSourceCode: 'testEventSourceCode'
          },
          contents: [
            {id: '', bytes: ''}
          ]
        })
      });

      expect(textProductView).to.respondTo('destroy');
      expect(textProductView).to.respondTo('hide');
      expect(textProductView).to.respondTo('render');
      expect(textProductView).to.respondTo('show');

      textProductView.destroy();
    });

    it('Instantiates without error with discrete parameters', function () {
      var textProductView = TextProductView({
        source: 'testSource',
        type: 'testType',
        code: 'testCode',
        eventSource: 'testEventSource',
        eventSourceCode: 'testEventSourceCode'
      });

      expect(textProductView).to.respondTo('destroy');
      expect(textProductView).to.respondTo('hide');
      expect(textProductView).to.respondTo('show');

      textProductView.destroy();
    });

  });

  describe('Show/Hide', function () {

    it('Is visible/hidden after being such calls', function () {
      var textProductView = TextProductView({
        source: 'testSource',
        type: 'testType',
        code: 'testCode',
        eventSource: 'testEventSource',
        eventSourceCode: 'testEventSourceCode'
      });

      /* jshint -W030 */
      expect(document.querySelector('.text-product-view')).to.be.null;
      /* jshint +W030 */

      textProductView.show();
      /* jshint -W030 */
      expect(document.querySelector('.text-product-view')).not.to.be.null;
      /* jshint +W030 */

      textProductView.hide();
      /* jshint -W030 */
      expect(document.querySelector('.text-product-view')).to.be.null;
      /* jshint +W030 */

      textProductView.destroy();
    });
  });
});
