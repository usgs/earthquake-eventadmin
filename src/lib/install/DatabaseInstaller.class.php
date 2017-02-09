<?php

/**
 * Base class for database installer.
 */
abstract class DatabaseInstaller {

	// PDO handle
	protected $dbh = null;
	// PDO url
	protected $url;
	// PDO user
	protected $user;
	// PDO password
	protected $pass;

	/**
	 * Factory method for a database installer based on driver type.
	 *
	 * @param $url {String}
	 *        PDO url.
	 * @param $user {$tring}
	 *        DB username.
	 * @param $pass {String}
	 *        DB password.
	 * @return SqliteDatabaseInstaller or MysqlDatabaseInstaller
	 * @throws Exception if an unsupported PDO url.
	 */
	public static function getInstaller($url, $user=null, $pass=null) {
		$type = substr($url, 0, strpos($url, ':'));
		if ($type === 'sqlite') {
			return new SqliteDatabaseInstaller($url, $user, $pass);
		} else if ($type === 'mysql') {
			return new MysqlDatabaseInstaller($url, $user, $pass);
		} else if ($type === 'pgsql') {
			return new PostgresDatabaseInstaller($url, $user, $pass);
		} else {
			throw new Exception('Unsupported database type "' . $type . '"');
		}
	}

	/**
	 * Constructor, called by subclasses.
	 *
	 * @param $url {String}
	 *        PDO url.
	 * @param $user {$tring}
	 *        DB username.
	 * @param $pass {String}
	 *        DB password.
	 */
	protected function __construct($url, $user, $pass) {
		$this->url = $url;
		$this->user = $user;
		$this->pass = $pass;
	}

	/**
	 * Connect to the database.
	 *
	 * @return {PDO} PDO connection with exception mode.
	 */
	public function connect () {
		if ($this->dbh === null) {
			$this->dbh = new PDO($this->url, $this->user, $this->pass);
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		return $this->dbh;
	}

	/**
	 * Disconnect from database.
	 */
	public function disconnect () {
		$this->dbh = null;
	}

	/**
	 * Run one or more sql statements.
	 *
	 * Removes c-style comments before execution.
	 *
	 * @param $statements {String}
	 *        semi-colon delimited list of statements to execute.
	 */
	public function run ($statements) {
		// make sure connected
		$dbh = $this->connect();

		// Remove /* */ comments
		$statements = preg_replace('#/\*.*\*/#', '', $statements);
		// split on semicolons that are outside of single quotes
		// http://stackoverflow.com/questions/21105360/regex-find-comma-not-inside-quotes
		$statements = preg_split("/(?!\B'[^']*);(?![^']*'\B)/", $statements);

		foreach ($statements as $sql) {
			$sql = trim($sql);
			if ($sql !== '') {
				try {
					$this->dbh->exec($sql);
				} catch (Exception $e) {
					echo 'SQL Exception: ' . $e->getMessage() . PHP_EOL .
							'While running:' . PHP_EOL . $sql . PHP_EOL;
					throw $e;
				}
			}
		}
		$dbh = null;
	}

	/**
	 * Run sql statements from a file.
	 *
	 * Same as $this->run(file_get_contents($file)).
	 *
	 * @param $file {String}
	 *        path to sql script.
	 */
	public function runScript ($file) {
		$this->run(file_get_contents($file));
	}

	/**
	 * Check whether the database referred to by $url exists.
	 *
	 * @return {Boolean} true if database already exists, false otherwise.
	 */
	public abstract function databaseExists ();

	/**
	 * Drop database referred to by $url.
	 */
	public abstract function dropDatabase ();

	/**
	 * Create database referred to by $url.
	 */
	public abstract function createDatabase ();

	/**
	 * Create database user.
	 */
	public abstract function createUser ($roles, $user, $password);

	/**
	 * Create database schema.
	 */
	public abstract function createSchema ($schema);


	/**
	 * Checks if postgis extension is enabled on current database.
	 */
	public abstract function postgisEnabled ();

}


// include sub classes, now that abstract class is defined.
include_once 'MysqlDatabaseInstaller.class.php';
