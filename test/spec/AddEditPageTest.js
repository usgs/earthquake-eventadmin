/* global chai, describe, it, sinon */
'use strict';


var AddEditPage = require('admin/AddEditPage');


var expect;

expect = chai.expect;


describe('AddEditPage', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof AddEditPage).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(AddEditPage).to.not.throw(Error);
    });

    it('can be destroyed', function () {
      var page;

      page = AddEditPage();
      expect(page.destroy).to.not.throw(Error);

      page.destroy();
    });
  });

  describe('onAddLinkClick', function () {
    it.skip('calls EditLinkView', function () {
      var options,
          stub,
          view;

      options = {
        eventDetails: {
          id: '12345',
          properties: {
            net: 'US',
            code: '54321'
          }
        }
      };

      view = AddEditPage(options);

      stub = sinon.stub(view.editLinkView, 'show', function () {
        return null;
      });

      view.onAddLinkClick();
      expect(stub.callCount).to.equal(1);

      stub.restore();
      view.destroy();
    });
  });
});
