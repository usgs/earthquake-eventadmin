'use strict';

var Util = require('util/Util'),
    View = require('mvc/View'),
    Xhr = require('util/Xhr');


var DEFAULTS = {
  url: 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'
};


var ChooseEventView = function (options) {
  var _this,
      _initialize,
      // variables
      _url,
      // methods
      _createEventSearch,
      _createForm,
      _createList,
      _errorMessage;

  _this = View(options);

  _initialize = function () {
    var el;

    options = Util.extend({}, DEFAULTS, options);
    _url = options.url;

    el = _this.el;
    el.innerHTML = '<section class="row choose-event">' +
        '<section class="one-of-two column">' +
          '<header><h2>Significant Earthquakes</h2></header>' +
          '<div class="eqlist"></div>' +
          '<header><h2>Event Time</h2></header>' +
          '<div class="eventTime"></div>' +
        '</section>' +
        '<section class="one-of-two column">' +
          '<header><h2>Event Lookup</h2></header>' +
          '<div class="form"></div>' +
        '</section>' +
      '</section>';

    _createEventSearch(el.querySelector('.eventTime'));
    _createForm(el.querySelector('.form'));
    _createList(el.querySelector('.eqlist'), _url);

    options = null;
  };

  _createEventSearch = function (el) {
    el.innerHTML = '<form class="vertical">' +
        '<label for="eventTime">' +
          'Time (UTC) ' +
        '<br/>' +
        '<small>Search 15 minutes around entered time.</small>' +
        '</label>' +
        '<input id="eventTime" name="eventTime" type="text" placeholder="yyyy-mm-dd hh:mm:ss"/>' +
        '<br/>' +
        '<button type="submit">Search</button>' +
        '</form>' +
        '<div class="searchList"></div>';

    el.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();

      var endtime,
          starttime,
          searchList,
          time,
          url;

      searchList = '.searchList';
      // get search time
      time = el.querySelector('#eventTime').value;
      time = new Date(time);

      try {
        // build search url
        starttime = new Date(time.getTime() - 900000);
        endtime = new Date(time.getTime() + 900000);

        url = 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' +
            '&starttime=' + starttime.toISOString() +
            '&endtime=' + endtime.toISOString();

        // load search results
        _createList(el.querySelector(searchList), url);
      } catch (ex) {
        _errorMessage(el.querySelector(searchList));
      }
    });
  };

  _errorMessage = function (el) {
    el.innerHTML = '<p class="alert">Error! Must use valid time.</p>';
  };

  _createForm = function (el) {
    el.innerHTML = '<form method="GET" action="event.php">' +
        '<label for="eventid">' +
          'Event ID' +
        '</label>' +
        '<input id="eventid" name="eventid" type="text"/>' +
        '<br/>' +
        '<button type="submit">View Event</button>' +
        '</form>' +
        '<p>If you do not know the Event ID:</p>' +
        '<ol>' +
        '<li>' +
          '<a target="_blank"' +
              ' href="http://earthquake.usgs.gov/earthquakes/map/">' +
            'Find the earthquake using the map' +
          '</a>' +
        '</li>' +
        '<li>' +
          'Open the event page by selecting the event,' +
          ' then clicking the link at the bottom of the list' +
        '</li>' +
        '<li>' +
          'Copy the event id at the end of the event page URL:' +
          '<br/><img class="eventid" src="eventid.png"' +
            ' alt="image showing event id in URL"/>' +
        '</li>' +
        '</ol>';
  };

  _createList = function (el, url) {
    Xhr.ajax({
      url: url,
      success: function (data) {
        var buf = [];
        data.features.forEach(function (eq) {
          var props = eq.properties,
              time;
          time = new Date(props.time).toISOString()
              .replace('T', ' ')
              .replace('Z', ' UTC');
          buf.push('<li>' +
              '<a class="eq" href="event.php?eventid=' + eq.id + '">' +
                  props.title +
                  '<small class="eventid">' + eq.id + '</small>' +
                  '<small class="eventtime">' + time + '</small>' +
              '</a>' +
              '</li>');
        });
        el.innerHTML = (buf.length === 0 ?
            '<p class="alert info">No earthquakes found</p>' :
            '<ul class="no-style">' + buf.join('') + '</ul>');
      },
      error: function () {
        el.innerHTML = '<p class="alert error">Unable to load earthquakes</p>';
      }
    });
  };

  _initialize();
  return _this;
};


module.exports = ChooseEventView;
