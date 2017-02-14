<?php

if (!function_exists('configure')) {
  function configure ($prompt, $default = null, $secure = false) {

    echo $prompt;
    if ($default != null) {
      echo ' [' . $default . ']';
    }
    echo ': ';

    if (NON_INTERACTIVE) {
      // non-interactive
      echo '(Non-interactive, using default)' . PHP_EOL;
      return $default;
    }

    if ($secure) {
      system('stty -echo');
    }

    $answer = trim(fgets(STDIN));

    if ($answer == '') {
      $answer = $default;
    }

    if ($secure) {
      system('stty echo');
      echo "\n";
    }

    return $answer;
  }
}

// This script should only be included by the pre-install.php script. The
// calling script is responsible for defining the $CONFIG_FILE_INI and calling
// date_default_timezone_set prior to including this configuration script.

$CONFIG = array();
if (file_exists($CONFIG_FILE_INI)) {
  $answer = configure('A previous configuration exists. ' .
      'Would you like to use it as defaults?', 'Y|n', false);

  if (strtoupper(substr($answer, 0, 1)) == 'Y') {
    $CONFIG = parse_ini_file($CONFIG_FILE_INI);
    print_r($CONFIG);
  }

  $answer = configure('Would you like to save the old configuration file?',
      'Y|n', false);

  if (strtoupper(substr($answer, 0, 1)) == 'Y') {
    $BAK_CONFIG_FILE = $CONFIG_FILE_INI . '.' . date('YmdHis');
    rename($CONFIG_FILE_INI, $BAK_CONFIG_FILE);
    echo 'Old configuration saved to file: ' . basename($BAK_CONFIG_FILE) .
        "\n";
  }
}

$FP_CONFIG = fopen($CONFIG_FILE_INI, 'w');
fwrite($FP_CONFIG, ';; auto generated: ' . date('r') . "\n\n");

// This data structure allows for simple configuration prompts
$prompts = array(
  // 'key' => array(
  //  'prompt' => String,  // Prompt to request value from user
  //  'default' => String, // Value to use if input is empty
  //  'secure' => Boolean  // True if input should not be echo'd to console
  // )

  'MOUNT_PATH' => array(
    'prompt' => 'URL Path for application',
    'default' => '/eventadmin',
    'secure' => false
  ),

  'SEARCH_STUB' => array(
    'prompt' => 'Site-relative path stub for GeoJSON content',
    'default' => '/fdsnws/event/1/query?format=geojson',
    'secure' => false
  ),

  'OFFSITE_HOST' => array(
    'prompt' => 'Offsite host where content exists',
    'default' => 'earthquake.usgs.gov',
    'secure' => false
  ),

  'PDL_JAR_FILE' => array(
    'prompt' => 'Path to PDL jar file (will offer to download later)',
    'default' => $LIB_DIR . '/ProductClient.jar',
    'secure' => false
  ),

  'PDL_SERVERS' => array(
    'prompt' => 'Server(s) where products are sent ( HOST:PORT[,HOST:PORT] )',
    'default' => '',
    'secure' => false
  ),

  'PDL_PRIVATE_KEY' => array(
    'prompt' => 'Private key used to sign products',
    'default' => '',
    'secure' => false
  ),


  'SQUID_SERVERS' => array(
    'prompt' => 'Squid caching servers for invalidation (comma separated list)',
    'default' => '',
    'secure' => false
  ),

  'SQUID_HOSTNAMES' => array(
    'prompt' => 'Hostname(s) to invalidate (comma separated list)',
    'default' => '',
    'secure' => false
  ),


  'SESSION_DB_DRIVER' => array(
    'prompt' => 'Session database driver',
    'default' => 'mysql',
    'secure' => false
  ),

  'SESSION_DB_HOST' => array(
    'prompt' => 'Session database hostname',
    'default' => '',
    'secure' => false
  ),

  'SESSION_DB_PORT' => array(
    'prompt' => 'Session database port',
    'default' => '3306',
    'secure' => false
  ),

  'SESSION_DB_NAME' => array(
    'prompt' => 'Session database name (database should already exist)',
    'default' => '',
    'secure' => false
  ),

  'SESSION_DB_TABLE' => array(
    'prompt' => 'Session database table (will be created)',
    'default' => '',
    'secure' => false
  ),

  'SESSION_DB_USER' => array(
    'prompt' => 'Session database user (must have read/write access)',
    'default' => '',
    'secure' => false
  ),

  'SESSION_DB_PASS' => array(
    'prompt' => 'Session database user password',
    'default' => '',
    'secure' => true
  ),


  'AD_HOST' => array(
    'prompt' => 'Active Directory hostname',
    'default' => '',
    'secure' => false
  ),

  'AD_USER' => array(
    'prompt' => 'Active directory user (service account)',
    'default' => '',
    'secure' => false
  ),

  'AD_PASS' => array(
    'prompt' => 'Active directory user password',
    'default' => '',
    'secure' => true
  ),

  'AD_BASE_DN' => array(
    'prompt' => 'Active directory base dn',
    'default' => '',
    'secure' => false
  ),

  'AD_GROUP' => array(
    'prompt' => 'Active directory group (group to access the application)',
    'default' => '',
    'secure' => false
  )

);

foreach ($prompts as $key => $item) {
  $default = null;
  if (isset($CONFIG[$key])) {
    $default = $CONFIG[$key];
  } else if (isset($item['default'])) {
    $default = $item['default'];
  }

  fwrite($FP_CONFIG, $key . ' = "' .
      configure($item['prompt'], $default, isset($item['secure']) ? $item['secure'] : false) .
      "\"\n");
}

// Do any custom prompting here


// Close the file
fclose($FP_CONFIG);
