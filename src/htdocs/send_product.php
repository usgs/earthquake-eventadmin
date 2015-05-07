<?php

// always run inside a session
session_start();

if (!isset($_POST['product'])) {
    header('400 Bad Request');
    echo 'product parameter required';
    exit();
}


include_once '../conf/config.inc.php';
include_once '../lib/ProductSender.class.php';
include_once '../lib/functions.inc.php';

$uploadDir = realpath(sys_get_temp_dir() . 'file_upload_' . session_id());
$uploadPrefix = $CONFIG['MOUNT_PATH'] . '/file_upload.php?file=';

try {
  // session specific data directory
  $workingDir = sys_get_temp_dir() . 'send_product_' . session_id();
  if (!is_dir($workingDir)) {
    mkdir($workingDir);
  }

  // configure sender
  $sender = new ProductSender();
  if (!isset($CONFIG['PDL_JAR_FILE']) ||
      !isset($CONFIG['PDL_SERVERS']) ||
      !isset($CONFIG['PDL_PRIVATE_KEY'])) {
    throw new Exception('Run pre-install');
  }
  $sender->setCommand('java -jar ' . escapeshellarg($CONFIG['PDL_JAR_FILE']));
  $sender->setServers($CONFIG['PDL_SERVERS']);
  $sender->setWorkingDir($workingDir);
  if (file_exists($CONFIG['PDL_PRIVATE_KEY'])) {
    $sender->setPrivateKeyFile($CONFIG['PDL_PRIVATE_KEY']);
  }


  // parse product
  $product = json_decode($_POST['product'], true);
  $source = $product['source'];
  $type = $product['type'];
  $code = $product['code'];
  $status = $product['status'];
  $properties = $product['properties'];
  $links = $product['links'];
  $inlineContent = null;
  $inlineContentType = null;


  // make product specific directory
  $workingDir = $workingDir . '/' . $source . '_' . $type . '_' . $code;
  if (is_dir($workingDir)) {
    // remove existing directory
    rrmdir($workingDir);
  }
  // make directory recursively
  mkdir($workingDir, 0777, true);

  // close session to allow parallel requests
  session_write_close();


  // convert contents to files
  $contents = $product['contents'];
  $directory = null;
  foreach ($contents as $path => $content) {
    if ($path === '') {
      if (!isset($content['bytes'])) {
        if (isset($content['url'])) {
          $content['bytes'] = file_get_contents($content['url']);
        } else {
          throw new Exception('Inline content (path "") must use "bytes"');
        }
      }
      $inlineContent = $content['bytes'];
      $inlineContentType = $content['contentType'] || 'text/plain';
    } else {
      if ($directory === null) {
        $directory = $workingDir;
      }
      // some sanitization of path
      $path = str_replace('..', '__', $path);
      $file = $directory . DIRECTORY_SEPARATOR . $path;
      // make sure parent directory exists
      $parentDir = dirname($file);
      if (!is_dir($parentDir)) {
        mkdir($parentDir, 0777, true);
      }
      // create or download content
      if (isset($content['bytes'])) {
        file_put_contents($file, $content['bytes']);
      } else {
        $url = $content['url'];
        if (strpos($url, $uploadPrefix) === 0) {
          // uploaded file is local
          $url = str_replace($uploadPrefix, '', $url);

          $uploadFile = realpath($uploadDir . DIRECTORY_SEPARATOR . $url);

          if (strpos($uploadFile, $uploadDir) === 0) {
            file_put_contents($file, file_get_contents($uploadFile));
          } else {
            throw new Exception('The uploaded file must be in the upload ' .
                'directory. ' . $uploadFile . ':' . $uploadDir);
          }
        } else if (!downloadURL($url, $file, false)) {
          throw new Exception('Unable to download url ' . $content['url']);
        }
      }
      // preserve last modified
      if (isset($content['lastModified'])) {
        touch($file, $content['lastModified'] / 1000);
      }
    }
  }


  // TODO: validate product


  // build product
  $sender->setSource($source);
  $sender->setType($type);
  $sender->setCode($code);
  $sender->setStatus($status);
  $sender->setProperties($properties);
  $sender->setLinks($links);
  $sender->setInlineContent($inlineContent);
  $sender->setInlineContentType($inlineContentType);
  $sender->setDirectory($directory);


  // send and return output
  header('Content-type: application/json');
  echo json_encode($sender->send());

  // product was sent, remove directory
  rrmdir($workingDir);
} catch (Exception $e) {
  header('HTTP/1.0 400 Bad Request');
  header('Content-type: application/json');
  echo json_encode(array(
     'error' => $e->getMessage()
  ));
}
