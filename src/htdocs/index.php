<?php

if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';
  $eventAdminConfig = array(
    'offsiteHost' => $CONFIG['OFFSITE_HOST'],
    'detailsStub' => $CONFIG['DETAILS_STUB']
  );

  $TITLE = 'Choose Event';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
  $FOOT = '<script>' .
      'var EventAdminConfig = ' . json_encode($eventAdminConfig) . ';' .
      '</script>' .
      '<script src="js/index.js"></script>';

  include 'template.inc.php';
}

?>

<section class="eventadmin">
  <noscript>
    Event Admin requires javascript.
  </noscript>
</section>
