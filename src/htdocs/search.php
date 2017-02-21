<?php

if (!isset($TEMPLATE)) {
  include_once '../lib/session.inc.php';
  include_once '../conf/config.inc.php';

  // Only pass on what we need to expose
  $config = array(
    'OFFSITE_HOST' => $CONFIG['OFFSITE_HOST'],
    'SEARCH_STUB' => $CONFIG['SEARCH_STUB']
  );

  $TITLE = 'Choose Event';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/search.css"/>';
  $FOOT = '
    <script>
      var CONFIG = ' . json_encode($config) . ';
    </script>
    <script src="js/search.js"></script>
  ';

  include 'template.inc.php';
}

?>

<section class="eventadmin">
  <noscript>
    Event Admin requires javascript.
  </noscript>
</section>
