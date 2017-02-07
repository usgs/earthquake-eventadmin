<?php
//
// This file provides functionality for fetching event details from the
// configured source. It reads the eventid request parameter and uses it
// to make a request to the search stub for details. It will redirect to
// preferred event id information if necessary and provide a default error
// response if details are not available.
//

include_once 'functions.inc.php';
include_once '../conf/config.inc.php';

$eventid = param('eventid');
if ($eventid === null || $eventid === '') {
  header('Location: ./');
  exit();
}

$PROTO = 'http://';
if (
    // Forward HTTPS terminated at caching tier
    (
      isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
      $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https'
    ) ||
    // Direct HTTPS request
    (
      isset($_SERVER['HTTPS']) &&
      $_SERVER['HTTPS'] != 'Off'
    )
  ) {
  $PROTO = 'https://';
}

if (isset($CONFIG['OFFSITE_HOST']) && $CONFIG['OFFSITE_HOST'] != '') {
  $OFFSITE_HOST = $PROTO . $CONFIG['OFFSITE_HOST'];
} else {
  $OFFSITE_HOST = $PROTO . $_SERVER['HTTP_HOST'];
}

$SEARCH_STUB = $OFFSITE_HOST . $CONFIG['SEARCH_STUB'];
$SEARCH_PATH = $CONFIG['SEARCH_STUB'] .
    '&includesuperseded=true&eventid=' . $eventid;
$SEARCH_URL = $OFFSITE_HOST . $SEARCH_PATH;

$ch = curl_init($SEARCH_URL);
curl_setopt_array($ch, array(
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => true));
$EVENT_FEED = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode !== 200) {
  // cache "error" for 1 minute
  $now = time();
  $maxAge = 60;
  header('Cache-Control: max-age=' . $maxAge);
  header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', $now + $maxAge));
  header('Last-Modified: ' . gmdate('D, d M Y H:i:s \G\M\T', $now));

  if ($httpCode === 404 || $httpCode === 204) {
    // event not found
    header('HTTP/1.0 404 Not Found');
  } else if ($httpCode === 409) {
    header('HTTP/1.0 410 Gone');
    $TITLE = 'Event Deleted';
    include_once 'template.inc.php';
  } else {
    // other, unexpected return
    header('HTTP/1.0 503 Service Unavailable');
    echo 'Unable to retrieve event information (' . $httpCode . ')';
  }
  exit(-1);
}

$EVENT = json_decode($EVENT_FEED, true);

$PROPERTIES = $EVENT['properties'];
$GEOMETRY = $EVENT['geometry'];

if ($PROPERTIES['net'] . $PROPERTIES['code'] !== $eventid) {
  header('HTTP/1.1 301 Moved Permanently');
  header('Location: event.php?eventid=' .
      $PROPERTIES['net'] . $PROPERTIES['code']);
  return;
}

$EVENT_CONFIG = array(
  'MOUNT_PATH' => $CONFIG['MOUNT_PATH'],
  'KML_STUB' => isset($CONFIG['KML_STUB']) ? $CONFIG['KML_STUB'] : null,
  'DYFI_RESPONSE_URL' => $CONFIG['DYFI_RESPONSE_URL'],
  'OFFSITE_HOST' => $CONFIG['OFFSITE_HOST'],
  'SEARCH_PATH' => $SEARCH_PATH,
  'SEARCH_STUB' => $SEARCH_STUB
);
