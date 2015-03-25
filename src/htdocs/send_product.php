<?php

if (!isset($_POST['product'])) {
    header('400 Bad Request');
    echo 'product parameter required';
    exit();
}

include_once '../conf/config.inc.php';
include_once '../lib/ProductSender.class.php';




$product = json_decode($_POST['product'], true);
print_r($product);

exit();



$sender = new ProductSender();
$sender->setCommand($CONFIG['PDL_COMMAND']);
$sender->setWorkingDir($DATA_DIR);
$sender->setConfigFile($CONFIG['PDL_CONFIG_FILE']);
if (file_exists($CONFIG['PDL_PRIVATE_KEY'])) {
	$sender->setPrivateKeyFile($CONFIG['PDL_PRIVATE_KEY']);
}
