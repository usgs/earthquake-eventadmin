/* global chai, describe, it */
'use strict';

var Product = require('Product'),

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
            {path: '', bytes: ''}
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
      expect(textProductView).to.respondTo('render');
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
      expect(document.querySelector('.textproduct')).to.be.null;
      /* jshint +W030 */

      textProductView.show();
      /* jshint -W030 */
      expect(document.querySelector('.textproduct')).not.to.be.null;
      /* jshint +W030 */

      textProductView.hide();
      /* jshint -W030 */
      expect(document.querySelector('.textproduct')).to.be.null;
      /* jshint +W030 */

      textProductView.destroy();
    });
  });

  describe('Render', function () {

    it('Accurately reflects product values', function () {
      var productText = 'This is some cool test text.';

      var textProductView = TextProductView({
        product: Product({
          type: 'testType',
          source: 'testSource',
          code: 'testCode',
          properties: {
            eventsource: 'testEventSource',
            eventsourcecode: 'testEventSourceCode'
          },
          contents: [
            {
              bytes: productText,
              id: '',
              lastModified: (new Date()).getTime(),
              length: productText.length,
              type: 'text/html'
            }
          ]
        })
      });

      var el = textProductView.el,
          textEl = el.querySelector('.textproduct-text');

      expect(textEl.value).to.not.equal(productText);

      textProductView.render();

      expect(textEl.value).to.equal(productText);

      textProductView.destroy();
    });
  });
});
