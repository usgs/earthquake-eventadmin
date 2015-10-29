<?php

  include_once 'functions.inc.php';
  include_once '../conf/config.inc.php';

  $eventid = param('eventid');
  if ($eventid === null || $eventid === '') {
    header('Location: ./');
    exit();
  }

  if (isset($CONFIG['OFFSITE_HOST']) && $CONFIG['OFFSITE_HOST'] != '') {
    $OFFSITE_HOST = 'http://' . $CONFIG['OFFSITE_HOST'];
  } else {
    $OFFSITE_HOST = 'http://' . $_SERVER['HTTP_HOST'];
  }

  $SEARCH_STUB = $OFFSITE_HOST . $CONFIG['SEARCH_STUB'];
  $SEARCH_URL = $SEARCH_STUB . '&includesuperseded=true&eventid=' . $eventid;

  $verbose = fopen('php://temp', 'w+');

  $ch = curl_init($SEARCH_URL);
  curl_setopt_array($ch, array(
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_VERBOSE => true,
      CURLOPT_STDERR => $verbose));
  $EVENT_FEED = curl_exec($ch);

  rewind($verbose);
  header('Content-type: text/plain');
  echo stream_get_contents($verbose);
  fclose($verbose);

?>
