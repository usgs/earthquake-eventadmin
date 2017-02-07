<?php

if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';

  $TITLE = 'Login - Event Admin';
  $NAVIGATION = true;
  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';

  include 'template.inc.php';
}

// Check for error param and display message
if (param('error')) {
  print '<p class="alert error">' . param('error') . '</p>';
}

?>


<!-- Login Form -->
<form class="login-form" action="index.php" method="post">
  <h3>Please Login</h3>
  <label for="username-input">Username</label>
  <input type="text" id="username-input" placeholder="Username" required="" autofocus="">
  <label for="password-input">Password</label>
  <input type="password" id="password-input" placeholder="Password" required="">
  <button type="submit">Login</button>
</form>