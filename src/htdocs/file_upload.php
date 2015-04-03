<?php

// upload directory is session specific
session_start();

// session specific data directory
$uploadDir = sys_get_temp_dir() . 'file_upload_' . session_id();
if (!is_dir($uploadDir)) {
  mkdir($uploadDir);
}

// close session to allow parallel requests
session_write_close();


include_once '../conf/config.inc.php';
include_once '../lib/functions.inc.php';


// SERVE ALREADY UPLOADED FILE

if (isset($_GET['file'])) {
  $name = $_GET['file'];
  // sanitize name, to keep it in this directory
  $name = strtr($name, array(
    '/' => '_',
    '\\' => '_',
    '..' => '_'
  ));
  $path = $uploadDir . '/' . $name;
  if (!file_exists($path)) {
    header('HTTP/1.0 404 File Not Found');
    exit();
  }

  // serve uploaded file
  $finfo = finfo_open(FILEINFO_MIME);
  header('Content-type: ' . finfo_file($finfo, $path));
  finfo_close($finfo);
  $fp = fopen($path, 'rb');
  fpassthru($fp);
  fclose($fp);
  exit();
}


// UPLOAD FILE

if (!isset($_FILES['file'])) {
  $requestSize = $_SERVER['CONTENT_LENGTH'];
  $requestLimit = min(ini_get('post_max_size'),
      ini_get('upload_max_filesize'));
  $units = strtoupper(substr($requestLimit, -1));
  if ($units === 'G') {
    $bytesLimit = $requestLimit * 1024 * 1024 * 1024;
  } else if ($units === 'M') {
    $bytesLimit = $requestLimit * 1024 * 1024;
  } else if ($units === 'K') {
    $bytesLimit = $requestLimit * 1024;
  }
  if ($requestSize > $bytesLimit) {
    // over size limit
    header('HTTP/1.0 413 Request Entity Too Large');
    echo 'File upload size limit is ' . $requestLimit;
  } else {
    header('HTTP/1.0 400 Bad Request');
    echo 'Parameter "file" is required.';
  }
  exit();
}

$file = $_FILES['file'];
$name = $file['name'];
// sanitize name, to keep it in this directory
$name = strtr($name, array(
  '/' => '_',
  '\\' => '_',
  '..' => '_'
));

$contentType = $file['type'];
$lastModified = intval($_POST['lastModified']);
$length = $file['size'];
$url = $CONFIG['MOUNT_PATH'] . '/file_upload.php?file=' . urlencode($name);

// move to upload folder
$path = $uploadDir . '/' . $name;
move_uploaded_file($file['tmp_name'], $path);
// preserve last modified
touch($path, $lastModified/1000);

// return "content" object
header('Content-type: application/json');
echo json_encode(array(
  'name' => $name,
  'contentType' => $contentType,
  'lastModified' => $lastModified,
  'length' => $length,
  'url' => $url
));
