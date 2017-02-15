<?php

/**
 * This class wraps up basic authentication and authorization methods for use
 * against an LDAP server. It uses the LDAP library and the PHP environment
 * must be compiled with LDAP support.
 *
 * This class is not a robust or fully-featured LDAP interface but rather
 * simply abstracts a few key methods necessary for authentication and
 * authorization.
 *
 */
class LDAPAuth {

  /**
   * Constructor
   *
   * Creates a new instance of an LDAPAuth.
   *
   * @param $server {String}
   *     The server to use for authentication.
   * @param $basedn {String}
   *     A base DN to use to scope all LDAP queries.
   * @param $username {String}
   *     The service account used for binding.
   * @param $password {String}
   *     The password corresponding to the service account used for binding.
   *
   * @return {LDAPAuth}
   */
  public function __construct ($server, $basedn, $username, $password) {
    $this->ldap = $this->connect($server, $username, $password);

    $this->server = $server;
    $this->basedn = $basedn;
  }

  public function __destruct () {
    @ldap_unbind($this->ldap);
  }


  /**
   * Connects to the given $server and binds using the given $username and
   * $password. Sets a few options that are necessary for this class to work
   * with the connection.
   *
   * @param $server {String}
   *     Host name of the server to connect to.
   * @param $username {String}
   *     The name of the user to bind as.
   * @param $password {String}
   *     The password to use when binding.
   *
   * @return {Mixed}
   *     A valid LDAP connection resource if the connection succeeds or
   *     FALSE if anything goes awry.
   */
  public function connect ($server, $username, $password) {
    try {
      $ldap = @ldap_connect("ldaps://${server}");

      @ldap_set_option($ldap, LDAP_OPT_TIMELIMIT, 5);
      @ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);
      @ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);

      if (!@ldap_bind($ldap, $username, $password)) {
        $ldap = false;
      }
    } catch (Exception $ex) {
      $ldap = false;
    }

    return $ldap;
  }

  /**
   * Finds the distinguished name (DN) corresponding to the given
   * $sAMAccountName. Works for both people and groups.
   *
   * @param $sAMAccountName {String}
   *     The sAMAccountName for which to find the corresponding distinguished
   *     name.
   *
   * @return {String}
   *     The distinguished name (DN) corresponding to the given $sAMAccountName.
   */
  public function getDn ($sAMAccountName) {
    $result = $this->search("sAMAccountName=${sAMAccountName}", array('dn'));

    if (count($result) == 1) {
      return $result[0]['dn'];
    } else {
      // 0 or >1 means not found or ambiguous. no dn.
      return null;
    }
  }

  /**
   * Recursively gets all members of the given $group.
   *
   * @param $group {String}
   *     The sAMAccountName of the group to get members for.
   *
   * @return {Array}
   *     An array with unique values containing all the members of the
   *     given $group (recursively).
   */
  public function getGroupMembers ($group) {
    return array_keys($this->_getGroupMembers($group));
  }

  /**
   * Checks if the given $username/$password combination is valid.
   *
   * @param $username {String}
   *     sAMAccountName of the user to authenticate.
   * @param $password {String}
   *     AD password to use when authenticating the user.
   *
   * @return {Boolean}
   *     True if the given $username/$password combination is valid, false
   *     otherwise.
   */
  public function isAuthenticated ($username, $password) {
    $userdn = $this->getDn($username);
    return ($this->connect($this->server, $userdn, $password) !== false);
  }

  /**
   * Ensures the provided $username/$password combination are valid in AD and
   * that the user identified by the provided $username is in the provided
   * $group.
   *
   * @param $username {String}
   *     The sAMAccountName of the user to authorize.
   * @param $password {String}
   *     The active directory password for the given user.
   * @param $group {String}
   *     The SAMAccountName of the group to verify the given user is a member
   *     of. Note that group membership is checked recursively.
   *
   * @return {Boolean}
   *     True if the provided $username/$password combination is correect and
   *     the user is a member of the provided $group. False otherwise.
   */
  public function isAuthorized ($username, $password, $group) {
    return $this->isAuthenticated($username, $password) &&
        $this->isUserInGroup($username, $group);
  }

  /**
   * Checks if the user identified by the given $username is in the group
   * identified by the given $groupname.
   *
   * @param $username {String}
   *     sAMAccountName for the user to check for membership.
   * @param $groupname {String}
   *     sAMAccountName for the group to check for membership.
   *
   * @return {Boolean}
   *     True of the user is in the group (recursively) or false otherwise.
   */
  public function isUserInGroup ($username, $groupname) {
    $userdn = $this->getDn($username);
    $members = $this->getGroupMembers($groupname);

    return in_array($userdn, $members);
  }

  /**
   * Perform an arbitrary search against LDAP.
   *
   * @param $filter {String}
   *     An LDAP search string.
   * @param $fields {Array}
   *     An array of fields to fetch for records matched by the search.
   *
   * @return {Array}
   *     An array of all results matching the given filter. Each object in the
   *     array is itself an array keyed on the requested field (if it was found
   *     in AD for the matched result).
   */
  public function search ($filter, $fields) {
    $results = array();
    $ldap_result = ldap_search($this->ldap, $this->basedn, $filter, $fields);
    $ldap_entries = ldap_get_entries($this->ldap, $ldap_result);

    for ($i = 0; $i < $ldap_entries['count']; $i++) {
      $ldap_entry = $ldap_entries[$i];
      $result = array();

      // In case user specified $fields=array('*'), now we have to enummerate
      // all returned fields ourselves. Meh.
      if (count($fields) == 1 && $fields[0] == '*') {
        $fields = array();
        for ($j = 0; $j < $ldap_entry['count']; $j++) {
          array_push($fields, $ldap_entry[$j]);
        }
      }

      foreach ($fields as $field) {
        $lowerfield = strtolower($field);

        if (isset($ldap_entry[$lowerfield])) {
          $value = $ldap_entry[$lowerfield];

          if (is_array($value) && isset($value['count'])) {
            if ($value['count'] == 1) {
              $value = $value[0];
            } else {
              unset($value['count']);
            }
          }

          $result[$field] = $value;
        }
      }

      array_push($results, $result);
    }

    return $results;
  }


  /**
   * Private method.
   *
   * Recursively searches for members of the given group. Used by public
   * version of method $this->getGroupMembers. Notably different as this
   * returns an array with _keys_ identifying the members such that a unique
   * list can be generated while the public version has returns the keys
   * of this method (which is typically more useful).
   *
   * @param $group {String}
   *     The sAMAccountName of the group to search for members of.
   *
   * @return {Array}
   *     An array containing keys identifying all unique members of the given
   *     group. Members must be objectClass=person.
   */
  private function _getGroupMembers ($group) {
    $result = array();

    $groupdn = $this->getDn($group);

    // Find groups that are members of this group
    $subgroups = $this->search("(&(memberOf=${groupdn})(objectClass=group))",
        array('sAMAccountName'));

    // Find people that are members of each sub-group
    foreach ($subgroups as $subgroup) {
      $result = array_merge($result,
          $this->_getGroupMembers($subgroup['sAMAccountName']));
    }

    // Find people that are members of this group
    $members = $this->search("(&(memberOf=${groupdn})(objectClass=person))",
        array('dn'));

    foreach ($members as $member) {
      $result[$member['dn']] = true;
    }

    return $result;
  }
}
