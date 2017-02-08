<?php

// TODO :: Acutally perform authentication or try to get session information
//         out of the database.
include_once '../conf/config.inc.php';

if ($_SERVER['REQUEST_URI'] !== $CONFIG['MOUNT_PATH'] . '/login.php' &&
    $_SERVER['REQUEST_URI'] !== $CONFIG['MOUNT_PATH'] . '/logout.php') {
  $IS_LOGGED_IN = true;
  session_start();
} else {
  $IS_LOGGED_IN = false;
}
