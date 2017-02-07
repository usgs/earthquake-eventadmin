<?php

include_once 'functions.inc.php';
include_once '../conf/config.inc.php';

$eventid = param('eventid');
$links = '';

// If we know an $eventid, use it and provide links to switch between event
// and product management pages.
if ($eventid != null and $eventid != '') {
  $links .=
      navItem($CONFIG['MOUNT_PATH'] .
          '/event.php?eventid=' . $eventid, 'Manage Event') .
      navItem($CONFIG['MOUNT_PATH'] .
          '/products.php?eventid=' . $eventid, 'Manage Products')
    ;
}

echo navGroup('Event Admin',
    navItem($CONFIG['MOUNT_PATH'] . '/index.php', 'Search Events') .
    $links
  );
