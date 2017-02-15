/* global after, before, chai, describe, it, sinon */
'use strict';

var Collection = require('mvc/Collection'),
    ContentsManagerView = require('admin/ContentsManagerView'),
    Product = require('admin/Product'),
    ProductContent = require('admin/ProductContent');

var expect;

expect = chai.expect;

describe('ContentsManagerView', function () {
  var product;

  before(function () {
    product = Product({
      type: 'general-header',
      source: 'admin',
      code: '1234',
      properties: {
        eventsource: 'us',
        eventsourcecode: '4568',
        'review-status': 'Reviewed',
      },
      contents: Collection([
        ProductContent({id: '', bytes: ''})
      ])
    });
  });

  after(function () {
    product = null;
  });

  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof ContentsManagerView).to.not.equal(null);
    });
  });

  describe('enhanceTextProductMarkup', function () {
    it('adds a radio list for general-header type products', function () {
      var el,
          view;

      el = document.createElement('div');

      view = ContentsManagerView({
        model: product
      });

      view.enhanceTextProductMarkup('general-header', el);

      expect(el.querySelectorAll('input').length).to.equal(5);
    });
  });

  describe('addAlertLevelWrapper', function () {
    it('calls getAlertLevelMarkup', function () {
      var getAlertLevelMarkupStub,
          view;

      view = ContentsManagerView({
        model: product
      });

      getAlertLevelMarkupStub = sinon.stub(view, 'getAlertLevelMarkup', function () {
        return;
      });

      view.addAlertLevelWrapper({target: {nodeName: 'INPUT'}});
      expect(getAlertLevelMarkupStub.callCount).to.equal(1);
    });

    it('calls onInlineEditChange', function () {
      var onInlineEditChangeStub,
          view;

      view = ContentsManagerView({
        model: product
      });

      onInlineEditChangeStub = sinon.stub(view, 'onInlineEditChange', function () {
        return;
      });

      view.addAlertLevelWrapper({target: {nodeName: 'INPUT'}});
      expect(onInlineEditChangeStub.callCount).to.equal(1);
    });
  });

  describe('getAlertLevelMarkup', function () {
    var textareaInput,
        view;

    before(function () {
      view = ContentsManagerView({
        model: product
      });
      textareaInput = view.el.querySelector('.contents-manager-view-inline-content-edit');
    });

    after(function () {
      view.destroy();
    });

    it('adds alert wrapper to input text', function () {
      var markup;

      // add text
      textareaInput.value = 'TESTING';
      // select input
      view.el.querySelector('#alert-none').removeAttribute('checked');
      view.el.querySelector('#alert-info').setAttribute('checked', true);

      markup = view.getAlertLevelMarkup();

      expect(markup).to.equal('<div class="alert info">' + textareaInput.value +
          '</div>');
    });
  });

  describe('updateInlineEditEl', function () {
    var el,
        stub,
        view;

    before(function () {
      view = ContentsManagerView({
        model: product
      });

      stub = sinon.stub(view, 'onInlineEditChange', function () {
        return;
      });

      el = view.el.querySelector('.contents-manager-view-inline-content-edit');
    });

    after(function () {
      view.destroy();
    });

    it('calls onInlineEditChange', function () {
      view.updateInlineEditEl();
      expect(stub.callCount).to.equal(1);
    });

    it ('updates the textarea text value', function () {
      var input;

      input = 'TEST';
      view.updateInlineEditEl(input);

      expect(el.value).to.equal(input);
    });

    it ('updates the disabled attrubte on the textarea', function () {
      var disabled;

      disabled = 'true';
      view.updateInlineEditEl('', disabled);

      expect(el.getAttribute('disabled')).to.equal(disabled);
    });
  });



});
