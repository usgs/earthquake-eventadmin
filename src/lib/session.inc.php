<?php

include_once '../conf/config.inc.php';
include_once dirname(__FILE__) . '/PdoSessionHandler.php';

$session_dsn = $CONFIG['SESSION_DB_DRIVER'] . ':' .
    'host=' . $CONFIG['SESSION_DB_HOST'] . ';' .
    'port=' . $CONFIG['SESSION_DB_PORT'] . ';' .
    'dbname=' . $CONFIG['SESSION_DB_NAME'];

$session_pdo = new PDO($session_dsn,
    $CONFIG['SESSION_DB_USER'], $CONFIG['SESSION_DB_PASS']);

$session_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$session_handler = new PdoSessionHandler($session_pdo, array(
  'db_table'    => $CONFIG['SESSION_DB_TABLE'],
  'db_id_col'   => 'session_id',
  'db_data_col' => 'session_data',
  'db_time_col' => 'session_expiration'
));

session_set_save_handler($session_handler, true);
session_start();

// Keep existing sessions active, otherwise assume not logged in yet
$_SESSION['IS_LOGGED_IN'] = (isset($_SESSION['IS_LOGGED_IN'])) ?
    $_SESSION['IS_LOGGED_IN'] : false;

// TODO :: Implement AD authentication
function authenticate ($username = null, $password = null) {
  return !(!$username || !$password);
}

if (isset($_POST['username']) || isset($_POST['password'])) {
  // login credentials sent, attempt to authenticate
  if (authenticate($_POST['username'], $_POST['password'])) {
    session_regenerate_id();
    $_SESSION['IS_LOGGED_IN'] = true;
    $_SESSION['username'] = $_POST['username'];
  } else {
    $LOGIN_ERROR = 'Invalid username/password combination';
  }
} else if ($_SERVER['REQUEST_URI'] != $CONFIG['MOUNT_PATH'] . '/index.php' &&
    $_SERVER['REQUEST_URI'] != $CONFIG['MOUNT_PATH'] . '/logout.php') {
  // Not logged in and requesting protected page
  header('HTTP/1.1 403 Forbidden');
  $LOGIN_ERROR = 'Authorization Required';
  $LOGIN_REDIRECT = $_SERVER['REQUEST_URI'];
}

if (!$_SESSION['IS_LOGGED_IN']) {
  // Re
  $loginPage = realpath(dirname(__FILE__) . '/../htdocs/index.php');

  $_SERVER['SCRIPT_FILENAME'] = $loginPage;
  include $loginPage;
  exit();
}
