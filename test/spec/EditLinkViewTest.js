/* global chai, describe, it */
'use strict';

var  EditLinkView = require('admin/EditLinkView');


var expect = chai.expect;

describe('EditLinkViewTest', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(EditLinkView).to.not.equal(null);
    });
  });

  describe('shows / Hides modal view', function () {

    it('is visible/hidden after being called', function () {
      var editLinkView = EditLinkView({
        source: 'testSource',
        type: 'testType',
        code: 'testCode',
        eventSource: 'testEventSource',
        eventSourceCode: 'testEventSourceCode'
      });

      editLinkView.show();
      /* jshint -W030 */
      expect(document.querySelector('#linkText')).not.to.be.null;
      /* jshint +W030 */

      editLinkView.hide();
      /* jshint -W030 */
      expect(document.querySelector('#linkText')).to.be.null;
      /* jshint +W030 */
    });
  });
});
