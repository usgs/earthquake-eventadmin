<?php

if (!isset($TEMPLATE)) {

  //
  // Get event details. Will set the following variables
  //   $EVENT {Array}
  //     Associative array containing event detail information
  //   $PROPERTIES {Array}
  //     Associative array containing event properties
  //     Same as $EVENT['properties']
  //   $GEOMETRY {Array}
  //     Associative array containing event geometry
  //     Same as $EVENT['geometry']
  //   $EVENT_CONFIG {Array}
  //     Associative array containing installation configuration parameters
  //   $eventid {String}
  //     Event id provided in request parameter
  //

  include_once '../lib/details.inc.php';

  $TITLE = $PROPERTIES['title'];
  $NAVIGATION = true;

  $HEAD = '<link rel="stylesheet" href="css/products.css"/>';
  $FOOT = '
    <script>
      var EventConfig = ' . json_encode($EVENT_CONFIG) . ';
      var EventDetails = ' . json_encode($EVENT) . ';
    </script>
    <script src="js/products.js"></script>
  ';

  include_once 'template.inc.php';
}

if ($httpCode != 409) {
  echo '<div class="eventadmin-products"></div>';
} else {
  echo '<p class="alert error">The requested event has been deleted.</p>';
}
