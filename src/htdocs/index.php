<?php
if (!isset($TEMPLATE)) {
  include_once 'functions.inc.php';

  // Defines the $CONFIG hash of configuration variables
  include_once '../conf/config.inc.php';

  $eventAdminConfig = array(
    'OFFSITE_HOST' => $CONFIG['OFFSITE_HOST'],
    'DETAILS_STUB' => $CONFIG['DETAILS_STUB']
  );

  $TITLE = 'Event Admin';
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
  $FOOT = '<script>' .
      'var EventAdminConfig = ' . json_encode($eventAdminConfig) . ';' .
    '</script>' .
    '<script src="js/index.js"></script>';

  include_once 'template.inc.php';
}

?>
<p>Content goes here</p>
