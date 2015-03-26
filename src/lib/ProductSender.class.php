<?php


/**
 * Send a product using PDL's command line interface.
 *
 */
class ProductSender {

	public static $STATUS_UPDATE = 'UPDATE';
	public static $STATUS_DELETE = 'DELETE';

	public static $DEFAULT_TRACKER_URL = 'http://ehppdl1.cr.usgs.gov/tracker/';
	public static $DEFAULT_INLINE_CONTENT_TYPE = 'text/plain';

	public static $EXIT_CODES = array(
		0 => 'OKAY',
		1 => 'EXIT_INVALID_ARGUMENTS',
		2 => 'EXIT_UNABLE_TO_BUILD',
		3 => 'EXIT_UNABLE_TO_SEND',
		4 => 'EXIT_PARTIALLY_SENT'
	);

	private $command;
	private $workingDir;

	private $servers;

	private $source;
	private $type;
	private $code;
	private $status;
	private $trackerURL;
	private $sentByEmail;
	private $properties;
	private $links;
	private $inlineContent;
	private $inlineContentType;
	private $contents;

	private $privateKeyFile;

	public function __construct() {
		// set defaults
		$this->workingDir = sys_get_temp_dir();
		$this->status = self::$STATUS_UPDATE;
		$this->trackerURL = self::$DEFAULT_TRACKER_URL;
		$this->inlineContentType = self::$DEFAULT_INLINE_CONTENT_TYPE;
	}

	public function getCommand() { return $this->command; }
	public function setCommand($command) { $this->command = $command; }

	public function getWorkingDir() { return $this->workingDir; }
	public function setWorkingDir($working) { $this->workingDir = $working; }

	public function getServers() { return $this->servers; }
	public function setServers($servers) { $this->servers = $servers; }

	public function getSource() { return $this->source; }
	public function setSource($source) { $this->source = $source; }

	public function getType() { return $this->type; }
	public function setType($type) { $this->type = $type; }

	public function getCode() { return $this->code; }
	public function setCode($code) { $this->code = $code; }

	public function getStatus() { return $this->status; }
	public function setStatus($status) { $this->status = $status; }

	public function getTrackerURL() { return $this->trackerURL; }
	public function setTrackerURL($url) { $this->trackerURL = $url; }

	public function getSentByEmail() { return $this->sentByEmail; }
	public function setSentByEmail($email) { $this->sentByEmail = $email; }

	public function getProperties() { return $this->properties; }
	public function setProperties($props) { $this->properties = $props; }

	public function getLinks() { return $this->links; }
	public function setLinks($links) { $this->links = $links; }

	public function getInlineContent() { return $this->inlineContent; }
	public function setInlineContent($content) { $this->inlineContent = $content; }

	public function getInlineContentType() { return $this->inlineContentType; }
	public function setInlineContentType($contentType) { $this->inlineContentType = $contentType; }

	public function getContents() { return $this->contents; }
	public function setContents($contents) { $this->contents = $contents; }

	public function getPrivateKeyFile() { return $this->privateKeyFile; }
	public function setPrivateKeyFile($keyFile) { $this->privateKeyFile = $keyFile; }


	/**
	 * Send a product using PDL's command line interface.
	 */
	public function send() {
		$command = $this->command;
		$args = array();

		if ($this->configFile) {
			$args[] = escapeshellarg('--configFile=' . $this->configFile);
		}

		$args[] = ' --send';
		$args[] = escapeshellarg('--servers=' . $this->servers);
		$args[] = escapeshellarg('--source=' . $this->source);
		$args[] = escapeshellarg('--type=' . $this->type);
		$args[] = escapeshellarg('--code=' . $this->code);
		$args[] = escapeshellarg('--status=' . $this->status);
		$args[] = escapeshellarg('--trackerURL=' . $this->trackerURL);
		$args[] = escapeshellarg('--property-senderemail=' . $this->sentByEmail);

		if ($this->properties) {
			foreach ($this->properties as $name => $value) {
				$args[] = escapeshellarg('--property-' . $name . '=' . $value);
			}
		}

		if ($this->links) {
			foreach ($this->links as $relation => $uris) {
				foreach ($uris as $uri) {
					$args[] = escapeshellarg('--link-' . $relation . '=' . $uri);
				}
			}
		}

		if ($this->inlineContent) {
			$args[] = '--content';
			$args[] = escapeshellarg('--contentType=' . $this->inlineContentType);
		}

		if ($this->contents) {
			foreach ($this->contents as $content) {
				$args[] = escapeshellarg('--file=' . $content);
			}
		}

		if ($this->privateKeyFile) {
			$args[] = escapeshellarg('--privateKey=' . $this->privateKeyFile);
		}

		$command = $command . ' ' . implode(' ', $args);


		//echo 'Using command ' . $command;


		$descriptors = array(
			0 => array('pipe', 'r'), //stdin
			1 => array('pipe', 'w'), //stdout
			2 => array('pipe', 'w')
		);

		$process = proc_open($command, $descriptors, $pipes, $this->workingDir);
		if (!is_resource($process)) {
			throw new Exception("Unable to start process using command '" . $command . "'");
		}

		if ($this->inlineContent) {
			// stream inline content via stdin
			fwrite($pipes[0], $this->inlineContent);
		}
		fclose($pipes[0]);

		// read output and exit code
		$error = stream_get_contents($pipes[2]);
		$output = stream_get_contents($pipes[1]);
		$exitCode = proc_close($process);

		return array(
				'exitCode' => $exitCode,
				'input' => $this->inlineContent,
				'output' => $output,
				'error' => $error,
				'command' => $command
			);
	}

}

?>
