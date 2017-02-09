<?php

include_once '../conf/config.inc.php';

session_start();

// TODO :: Acutally perform authentication or try to get session information
//         out of the database.
if ($_SERVER['REQUEST_URI'] !== $CONFIG['MOUNT_PATH'] . '/index.php' &&
    $_SERVER['REQUEST_URI'] !== $CONFIG['MOUNT_PATH'] . '/logout.php') {
  $IS_LOGGED_IN = true;
} else {
  $IS_LOGGED_IN = false;
}
