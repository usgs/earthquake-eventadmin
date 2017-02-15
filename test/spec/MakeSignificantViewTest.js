/* global chai, describe, it */
'use strict';

var MakeSignificantView = require('admin/MakeSignificantView');

var expect = chai.expect;

var //insignificant,
    significant;

// insignificant = {
//   'eventDetails': {
//     'properties': {
//       'type': 'significant',
//       'source': 'admin',
//       'code': 123456789,
//       'eventSource': 'US',
//       'eventSourceCode': 987654321,
//       'significance': 300
//     }
//   }
// };

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
});
