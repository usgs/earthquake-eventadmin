<?php

if (!isset($TEMPLATE)) {
  include_once 'functions.inc.php';
  include_once '../conf/config.inc.php';

  $eventid = param('eventid');
  if ($eventid === null || $eventid === '') {
    header('Location: ./');
    exit();
  }
  $eventAdminConfig = array(
    'offsiteHost' => $CONFIG['OFFSITE_HOST'],
    'detailsStub' => $CONFIG['DETAILS_STUB'],
    'eventId' => $eventid
  );

  $TITLE = 'Event Admin';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/event.css"/>';
  $FOOT = '<script>' .
      'var EventAdminConfig = ' . json_encode($eventAdminConfig) . ';' .
      '</script>' .
      '<script src="js/event.js"></script>';

  include 'template.inc.php';
}

?>

<section class="eventadmin">
  <noscript>
    Event Admin requires javascript.
  </noscript>
</section>
