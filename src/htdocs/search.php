<?php

if (!isset($TEMPLATE)) {
  include_once '../lib/session.inc.php';

  $TITLE = 'Choose Event';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/search.css"/>';
  $FOOT = '<script src="js/search.js"></script>';

  include 'template.inc.php';
}

?>

<section class="eventadmin">
  <noscript>
    Event Admin requires javascript.
  </noscript>
</section>
