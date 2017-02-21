<?php
if (!isset($TEMPLATE)) {
  include_once '../lib/session.inc.php';

  $_SESSION = array('IS_LOGGED_IN' => false);
  session_destroy();

  $TITLE = 'Log Out - Event Admin';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';

  include_once 'template.inc.php';
}
?>

<p class="alert info">
  You have been logged out of event admin.
</p>

<?php
  include_once dirname(__FILE__) . '/index.php';
?>
