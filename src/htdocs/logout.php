<?php
  if (!isset($TEMPLATE)) {
    include_once '../lib/session.inc.php';
    session_destroy();
    $IS_LOGGED_IN = false;

    $TITLE = 'Log Out - Event Admin';
    $NAVIGATION = true;

    include_once 'template.inc.php';
  }
?>

<p class="alert info">
  You have been logged out of event admin.
</p>
