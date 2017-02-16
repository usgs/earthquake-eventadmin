/* global chai, describe, it, sinon */
'use strict';

var MakeSignificantView = require('admin/MakeSignificantView');

var expect = chai.expect;

var insignificant,
    significant;

insignificant = {
  'type': 'significant',
  'source': 'admin',
  'code': 123456789,
  'eventSource': 'US',
  'eventSourceCode': 987654321,
  'significance': 300
};

significant = {
  'type': 'significant',
  'source': 'admin',
  'code': 123456789,
  'eventSource': 'US',
  'eventSourceCode': 987654321,
  'significance': 900
};

describe('MakeSignificantViewTest', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(MakeSignificantView).to.not.equal(null);
    });

    it('can be destroyed', function () {
      var view;

      view = MakeSignificantView(significant);

      expect(view.destroy).to.not.throw(Error);

      view.destroy();
    });
  });

  describe('checkSignificance', function () {
    it('calls isSignificant if a sig value is >= 600', function () {
      var stub,
          view;

      view = MakeSignificantView(significant);

      stub = sinon.stub(view, 'isSignificant', function () {
        return null;
      });

      view.checkSignificance();

      expect(stub.callCount).to.equal(1);

      stub.restore();
      view.destroy();
    });

    it('does not call isSignificant if a sig value is < 600', function () {
      var stub,
          view;

      view = MakeSignificantView(insignificant);

      stub = sinon.stub(view, 'isSignificant', function () {
        return null;
      });

      view.checkSignificance();

      expect(stub.callCount).to.equal(0);

      stub.restore();
      view.destroy();
    });

    it('sets the "sig" value to 600 if the event is insignificant', function () {
      var view;

      view = MakeSignificantView(insignificant);

      view.checkSignificance();

      expect(view.sig.value).to.equal('600');

      view.destroy();
    });
  });

  describe('isSignificant', function () {
    var view;

    view = MakeSignificantView(significant);

    view.isSignificant(750);

    it('adds correct classes', function () {
      expect(view.significantWarning.classList.contains('alert')).
          to.equal(true);
      expect(view.significantWarning.classList.contains('warning')).
          to.equal(true);
    });

    it('adds text', function () {
      expect(view.significantWarning).to.not.equal(null);
      expect(view.significantWarning).to.not.equal('');
    });

    it('sets "sig" value correctly', function () {
      expect(view.sig.value).to.equal('750');
    });

    view.destroy();
  });

  describe('shows / Hides modal view', function () {
    it('is visible/hidden after being called', function () {
      var view;

      view = MakeSignificantView(significant);

      view.show();
      /* jshint -W030 */
      expect(document.querySelector('#significant-value')).not.to.be.null;
      /* jshint +W030 */

      view.hide();
      /* jshint -W030 */
      expect(document.querySelector('#significant-value')).to.be.null;
      /* jshint +W030 */

      view.destroy();
    });
  });
});
