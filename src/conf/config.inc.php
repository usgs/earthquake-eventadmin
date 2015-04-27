<?php

date_default_timezone_set('UTC');

$CONFIG_INI_FILE = dirname(__FILE__) . '/config.ini';
if (!file_exists($CONFIG_INI_FILE)) {
  trigger_error('Application not configured. Run pre-install script.');
  exit(-1);
}

$CONFIG = parse_ini_file($CONFIG_INI_FILE);


// build absolute Event Page URL string
$server_protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'Off') ?
    'https://' : 'http://';
$server_host = isset($_SERVER['HTTP_HOST']) ?
    $_SERVER['HTTP_HOST'] : "localhost";
$server_port = isset($_SERVER['SERVER_PORT']) ? $_SERVER['SERVER_PORT'] : 80;
$HOST_URL_PREFIX = $server_protocol . $server_host;
if ( ($server_port == 80 && $server_protocol == 'http://') || ($server_port == 443 && $server_protocol == 'https://') ) {
  // don't need port
} else {
  // if a port is specified in the HTTP_HOST, don't use twice (ex: localhost:8080, perhaps used in port forwarding)
  if(!strpos($server_host, ':')) {
    $HOST_URL_PREFIX .= ':' . $server_port;
  }
}
