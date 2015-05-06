<?php

if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';

  $TITLE = 'Choose Event';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
  $FOOT = '<script src="js/index.js"></script>';

  include 'template.inc.php';
}

?>

<section class="eventadmin">
  <noscript>
    Event Admin requires javascript.
  </noscript>
</section>
