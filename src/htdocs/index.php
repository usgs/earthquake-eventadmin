<?php
if (!isset($TEMPLATE)) {
  include_once '../lib/session.inc.php';

  $TITLE = 'Login - Event Admin';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
  include 'template.inc.php';
}

// Check for error param and display message
$LOGIN_ERROR = isset($LOGIN_ERROR) ? $LOGIN_ERROR : param('error');
if ($LOGIN_ERROR) {
  print '<p class="alert error">' . $LOGIN_ERROR . '</p>';
}

if (isset($LOGIN_REDIRECT)) {
  $action = $LOGIN_REDIRECT;
} else {
  $action = $CONFIG['MOUNT_PATH'] . '/search.php';
}

?>


<!-- Login Form -->
<form class="login-form" action="<?php print $action; ?>" method="post">
  <h3>Please Login</h3>
  <label for="username-input">Username</label>
  <input type="text" id="username-input" name="username"
      placeholder="Username" required="" autofocus="">

  <label for="password-input">Password</label>
  <input type="password" id="password-input" name="password"
      placeholder="Password" required="">

  <button type="submit">Login</button>
</form>
