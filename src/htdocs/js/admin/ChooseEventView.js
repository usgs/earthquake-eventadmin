'use strict';


var Util = require('util/Util'),
    View = require('mvc/View'),
    Xhr = require('util/Xhr');


var _DEFAULTS;

_DEFAULTS = {
  url: '/earthquakes/feed/v1.0/summary/significant_month.geojson',
  OFFSITE_HOST: window.location.host, // includes host:port if applicable
  SEARCH_STUB: '/fdsnws/event/1/query?format=geojson'
};


var ChooseEventView = function (options) {
  var _this,
      _initialize,

      _eventTime,
      _searchAction,
      _searchForm,
      _searchList,
      _url,

      _createEventSearch,
      _createForm,
      _createList,
      _onEventSearchSubmit;


  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, _DEFAULTS, options);
    _url = '//' + options.OFFSITE_HOST + options.url;
    _searchAction = '//' + options.OFFSITE_HOST + options.SEARCH_STUB;

    el = _this.el;
    el.innerHTML = '<section class="row choose-event">' +
        '<section class="one-of-two column">' +
          '<header><h2>Significant Events</h2></header>' +
          '<div class="eqlist"></div>' +
        '</section>' +
        '<section class="one-of-two column">' +
          '<header><h2>Find an Event</h2></header>' +
          '<p>' +
            '<a target="_blank" ' +
                'href="https://earthquake.usgs.gov/earthquakes/map"' +
                '>Latest Earthquakes</a>' +
            '<br/>' +
            '<a target="_blank" ' +
                'href="https://earthquake.usgs.gov/earthquakes/search"' +
                '>Search Earthquake Archives</a>' +
          '</p>' +
          '<div class="eventId"></div>' +
          '<div class="eventTime"></div>' +
        '</section>' +
      '</section>';

    _createEventSearch(el.querySelector('.eventTime'));
    _createForm(el.querySelector('.eventId'));
    _createList(el.querySelector('.eqlist'), _url);
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
        '<div class="eqlist"></div>';

    _searchList = el.querySelector('.eqlist');
    _eventTime = el.querySelector('#eventTime');
    _searchForm = el.querySelector('form');

    _searchForm.addEventListener('submit', _onEventSearchSubmit);
  };

  _createForm = function (el) {
    el.innerHTML = '<form method="GET" action="event.php" class="vertical">' +
        '<label for="eventid">' +
          'Event ID' +
        '</label>' +
        '<input id="eventid" name="eventid" type="text"/>' +
        '<br/>' +
        '<button type="submit">View Event</button>' +
        '</form>';
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
              .replace(/\.[\d]+Z/, ' UTC');
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

  _onEventSearchSubmit = function (e) {
    var endTime,
        searchTime,
        startTime,
        url;

    e.preventDefault();

    searchTime = _eventTime.value.toUpperCase();

    if (searchTime.indexOf('Z') === -1) {
      searchTime = new Date(searchTime.concat('Z'));
    } else {
      searchTime = new Date(searchTime);
    }

    try {
      startTime = new Date(searchTime.getTime() - 900000);
      endTime = new Date(searchTime.getTime() + 900000);

      url = _searchAction +
          '&starttime=' + startTime.toISOString() +
          '&endtime=' + endTime.toISOString();

      _createList(_searchList, url);
    } catch (ex) {
      _searchList.innerHTML = '<p class="alert error">Must use valid time ' +
          'format: yyyy-mm-dd hh:mm:ss</p>';
    }
  };


  _this.destroy = Util.compose(function () {
    _searchForm.removeEventListener('submit', _onEventSearchSubmit);

    _createEventSearch = null;
    _createForm = null;
    _createList = null;
    _eventTime = null;
    _onEventSearchSubmit = null;
    _searchList = null;
    _searchForm = null;
    _url = null;
  }, _this.destroy);


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ChooseEventView;
