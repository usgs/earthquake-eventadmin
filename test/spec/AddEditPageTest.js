/* global chai, describe, it */
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
});
