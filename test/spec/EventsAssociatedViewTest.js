/* global after, before, chai, describe, it, sinon */
'use strict';

var EventsAssociatedView = require('admin/EventsAssociatedView'),
    Xhr = require('util/Xhr');

var expect;

expect = chai.expect;

describe('EventsAssociatedView', function () {
  var eventDetails;

  before(function (done) {
    Xhr.ajax({
      url: '/events/us10004u1y.json',
      success: function (data) {
        eventDetails = data;
        done();
      },
      error: function () {
        done(false);
      }
    });
  });

  after(function () {
    eventDetails = null;
  });

  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof EventsAssociatedView).to.not.equal(null);
    });

    it('can be destroyed', function () {
      var view;

      view = EventsAssociatedView({eventDetails: eventDetails});
      expect(view.destroy).to.not.throw(Error);

      view.destroy();
    });
  });

  describe('trumpCallBack', function () {
    it('calls sendProduct', function () {
      var stub,
          view;

      view = EventsAssociatedView({eventDetails: eventDetails});

      stub = sinon.stub(view, 'sendProduct', function () {
        return null;
      });

      view.trumpCallback({
        originProduct: {
          test: 'test'
        }
      });

      expect(stub.callCount).to.equal(1);

      stub.restore();
      view.destroy();
    });
  });
});
