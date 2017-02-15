<?php

include_once 'functions.inc.php';
include_once '../conf/config.inc.php';

if ($_SESSION['IS_LOGGED_IN']) {
  // User is logged in

  if (isset($eventid) && $eventid != null && $eventid != '') {
    // Managing an event
    echo
      navItem($CONFIG['MOUNT_PATH'] . '/search.php" class="up-one-level',
          'Search Events') .
      navGroup('Event: ' . $eventid,
        navItem($CONFIG['MOUNT_PATH'] . '/event.php?eventid=' . $eventid,
            'Manage') .
        navItem($CONFIG['MOUNT_PATH'] . '/addedit.php?eventid=' . $eventid,
            'Add/Edit Content') .
        navItem($CONFIG['MOUNT_PATH'] . '/products.php?eventid=' . $eventid,
            'All Products') .
        navItem('https://earthquake.usgs.gov/earthquakes/eventpage/' .
            $eventid . '" target="_blank', 'View Event Page') .
        navItem('https://earthquake.usgs.gov/earthquakes/map/',
            'Latest Earthquakes')
      );

  } else {
    echo
      navItem($CONFIG['MOUNT_PATH'] . '/search.php', 'Search Events');
  }

  echo navItem($CONFIG['MOUNT_PATH'] . '/logout.php', 'Log Out');
} else {
  echo navItem($CONFIG['MOUNT_PATH'] . '/index.php', 'Log In');
}
