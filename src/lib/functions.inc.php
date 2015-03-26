<?php


/**
 * Prompt user with a yes or no question.
 *
 * @param $prompt {String}
 *        yes or no question, should include question mark if desired.
 * @param $default {Boolean}
 *        default null (user must enter y or n).
 *        true for yes to be default answer, false for no.
 *        default answer is used when user presses enter with no other input.
 * @return {Boolean} true if user entered yes, false if user entered no.
 */
function promptYesNo ($prompt='Yes or no?', $default=null) {
	$question = $prompt . ' [' .
			($default === true ? 'Y' : 'y') . '/' .
			($default === false ? 'N' : 'n') . ']: ';
	$answer = null;
	while ($answer === null) {
		echo $question;
		$answer = strtoupper(trim(fgets(STDIN)));
		if ($answer === '') {
			if ($default === true) {
				$answer = 'Y';
			} else if ($default === false) {
				$answer = 'N';
			}
		}
		if ($answer !== 'Y' && $answer !== 'N') {
			$answer = null;
			echo PHP_EOL;
		}
	}
	return ($answer === 'Y');
}


/**
 * Download a URL into a file.
 *
 * @param $source {String}
 *        url to download.
 * @param $dest {String}
 *        path to destination.
 * @param $showProgress {Boolean}
 *        default true.
 *        output progress to STDERR.
 * @return {Boolean} false if $dest already exists, true if created.
 */
function downloadURL ($source, $dest, $showProgress=true) {
	if (file_exists($dest)) {
		return false;
	}
	if ($showProgress) {
		echo 'Downloading "' . $source . '"' . PHP_EOL;
	}
	$curl = curl_init();
	$file = fopen($dest, 'wb');
	curl_setopt_array($curl, array(
			CURLOPT_URL => $source,
			// write output to file
			CURLOPT_FILE => $file,
			// follow redirects
			CURLOPT_FOLLOWLOCATION => 1,
			// show progress
			CURLOPT_NOPROGRESS => ($showProgress ? 0 : 1)));
	curl_exec($curl);
	$errno = curl_errno($curl);
	curl_close($curl);
	fclose($file);
	if ($errno) {
		unlink($dest);
		throw new Exception('Unable to download, errno=' . $errno .
				' (' . curl_strerror($errno) . ')');
	}
	return true;
}


/**
 * Remove a directory recursively.
 * http://php.net/rmdir#98622
 *
 * @param $dir {String}
 *        directory to remove.
 */
function rrmdir($dir) {
  if (is_dir($dir)) {
    $objects = scandir($dir);
    foreach ($objects as $object) {
      if ($object !== '.' && $object !== '..') {
        $path = $dir . '/' . $object;
        if (is_dir($path)) {
          rrmdir($path);
        } else {
          unlink($path);
        }
      }
    }
    rmdir($dir);
  }
}
