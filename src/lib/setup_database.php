<?php
// This script prompts user if they would like to set up the database this
// includes the following steps.
//
// (1) Create the database schema
//     (1.1) If initially answering yes, notify current content may be
//           destroyed. If user confirms descision, wipe existing database and
//           create a new schema using script.
// (2) Load reference data into the database.
// (3) [Only if script is run directly]
//     Load observation data into database.
//
// Note: If the user declines any step along the way this script is complete.

date_default_timezone_set('UTC');

// work from lib directory
chdir($LIB_DIR);
include_once 'install/DatabaseInstaller.class.php';
include_once '../conf/config.inc.php';


echo "\n";
echo 'Using the following connection (' . 'mysql:host=' . $CONFIG['SESSION_DB_HOST'] . ';port=' . $CONFIG['SESSION_DB_PORT'] . ';dbname=' . $CONFIG['SESSION_DB_NAME'] . ')';
echo "\n";

$USERNAME = configure('Database adminitrator user', 'root', false);
$PASSWORD = configure('Database adminitrator password', null, true);


// ----------------------------------------------------------------------
// Schema loading configuration
// ----------------------------------------------------------------------

// Use admin user to create session table

$DB_DSN = $CONFIG['SESSION_DB_DRIVER'] . ':' .
  'host=' . $CONFIG['SESSION_DB_HOST'] . ';' .
  'port=' . $CONFIG['SESSION_DB_PORT'] . ';' .
  'dbname=' . $CONFIG['SESSION_DB_NAME'];

$dbInstaller = DatabaseInstaller::getInstaller($DB_DSN, $USERNAME, $PASSWORD);


// Session table

echo "\n";
echo 'Creating table for session management ... ';
$dbInstaller->run('DROP TABLE IF EXISTS ' . $CONFIG['SESSION_DB_TABLE']);
$dbInstaller->run('
  CREATE TABLE ' . $CONFIG['SESSION_DB_TABLE'] . ' (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    session_id         VARCHAR(32) UNIQUE KEY,
    session_data       TEXT,
    session_expiration INT NOT NULL
  )
');

// ----------------------------------------------------------------------
// End of database setup
// ----------------------------------------------------------------------

echo "\nNormal exit.\n";
exit(0);
