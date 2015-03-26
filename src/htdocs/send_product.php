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

try {
  // session specific data directory
  $workingDir = sys_get_temp_dir() . 'send_product_' . session_id();
  if (is_dir($workingDir)) {
    rrmdir($workingDir);
  }
  mkdir($workingDir);


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

  // convert contents to files
  $contents = $product['contents'];
  $files = array();
  foreach ($contents as $path => $content) {
    if ($path === '') {
      if (!isset($content['bytes'])) {
        throw new Exception('Inline content (path "") must use "bytes"');
      }
      $inlineContent = $content['bytes'];
      $inlineContentType = $content['contentType'] || 'text/plain';
    } else {
      $file = $workingDir . DIRECTORY_SEPARATOR . $path;
      if (isset($content['bytes'])) {
        file_put_contents($file, $content['bytes']);
      } else {
        if (!downloadURL($content['url'], $file, false)) {
          throw new Exception('Unable to download url ' . $content['url']);
        };
      }
      $files[] = $file;
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
  $sender->setContents($files);


  // send and return output
  header('Content-type: application/json');
  echo json_encode($sender->send());
} catch (Exception $e) {
  header('HTTP/1.0 400 Bad Request');
  header('Content-type: application/json');
  echo json_encode(array(
     'error' => $e->getMessage()
  ));
}
