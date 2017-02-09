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


$DB_DSN = 'mysql:host=' . $CONFIG['SESSION_DB_HOST'] . ';port=3306;dbname=' . $CONFIG['SESSION_DB_NAME'];



// ----------------------------------------------------------------------
// Schema loading configuration
// ----------------------------------------------------------------------

$dbInstaller = DatabaseInstaller::getInstaller($DB_DSN,
    $CONFIG['SESSION_DB_USER'], $CONFIG['SESSION_DB_PASS']);


// Session table

echo "\n";
echo 'Creating table for session management ... ';
$dbInstaller->run('DROP TABLE IF EXISTS ' . $CONFIG['SESSION_DB_TABLE']);
$dbInstaller->run('
  CREATE TABLE ' . $CONFIG['SESSION_DB_TABLE'] . ' (
    id         INT PRIMARY KEY,
    user       VARCHAR(100),
    session    VARCHAR(100)
  )
');

// ----------------------------------------------------------------------
// End of database setup
// ----------------------------------------------------------------------

echo "\nNormal exit.\n";
exit(0);
