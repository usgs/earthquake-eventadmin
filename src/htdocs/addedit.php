<?php

if (!isset($TEMPLATE)) {
  include_once '../lib/session.inc.php';

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

  $HEAD = '<link rel="stylesheet" href="css/addedit.css"/>';
  $FOOT = '
      <script>
        var EventConfig = ' . json_encode($EVENT_CONFIG) . ';
        var EventDetails = ' . json_encode($EVENT) . ';
      </script>
      <script src="js/addedit.js"></script>
    ';

  include 'template.inc.php';
}

if ($httpCode != 409) {
  echo '<div class="eventadmin-addedit"></div>';
} else {
  print '<p class="alert error">The requested event has been deleted.</p>';
}
