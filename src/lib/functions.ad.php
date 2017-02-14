<?php
include_once dirname(__FILE__) . '/../conf/config.inc.php';

/**
 * Verifies the supplied $username and $password combination are valid in
 * active directory and the returned account is a member of the necessary
 * group in active directory.
 *
 * @param $username {String}
 *     The username to use during authentication
 * @param $password {String}
 *     The password to use during authentication
 *
 * @return {Boolean}
 *     True if authentication succeeds, false otherwise.
 */
function authenticate ($username, $password) {
  global $CONFIG;

  $authenticated = false;
  $userDn = _ad_get_dn($username);
  $connection = _ad_connect($userDn, $password); // <-- Authenticate

  if ($connection) {
    // Find the group DN
    $members = _ad_get_group_members($connection, $CONFIG['AD_GROUP']);

    // TODO :: Make this search recursive since user may be a member of a group
    //         that is itself a member of this required group.
    $authenticated = in_array($userDn, $members); // <-- Authorize
  } else {
    $authenticated = false;
  }

  return $authenticated;
}


/**
 * HELPER FUNCTION
 *
 * Recursively flattens the default LDAP result set arrays. The default
 * structure is bloated with indexing etc... that is not needed in PHP.
 *
 * @param ldap {Array} An LDAP array structure to flatten.
 *
 * @return The flattened array more commonly used in PHP.
 */
function _ad_build_results($ldap) {
  $result = array();

  // Flatten all our results so they are less obtuse.
  for ($i = 0; $i < intval($ldap['count']); ++$i) {
    $key = $ldap[$i];

    if (is_array($key)) {
      $result = _ad_build_results($key);
    } else {
      $value = $ldap[$key];

      if (is_array($value)) {
        $result[$key] = _ad_build_results($value);
      } else {
        $result[$key] = $value;
      }
    }
  }

  // Special case. DN is always returned but not indexed.
  if (isset($ldap['dn'])) { $result['dn'] = $ldap['dn']; }

  return $result;
}

/**
 * HELPER FUNCTION
 *
 * Attempts to connect to known active directory servers over SSL using the
 * provided $username and $password (or their defaults if not provided).
 *
 * If a connection cannot be established due to network problems, false is
 * returned.
 *
 * If a connection is made successfully then the AD (LDAP) connection is
 * returned.
 *
 * @param username {String} The AD username credential.
 * @param password {String} The AD password credential.
 */
function _ad_connect ($username = false, $password = false) {
  global $CONFIG;

  if (!$username && !$password) {
    // Use defaults instead.
    $username = $CONFIG['AD_USER'];
    $password = $CONFIG['AD_PASS'];
  }

  $adservers = explode(',', $CONFIG['AD_HOST']);

  foreach ($adservers as $server) {
    // This NEVER returns false, even if the server can't be reached.
    $connect = ldap_connect("ldaps://${server}");

    // Set some options on the connection
    ldap_set_option($connect, LDAP_OPT_TIMELIMIT, 5); // 5 second timeout
    ldap_set_option($connect, LDAP_OPT_REFERRALS, 0); // Don't accept referral


    if ($connect && @ldap_bind($connect, $username, $password)) {
      // Connection succeeded. Return it.
      return $connect;
    } else {
      // Check the error codes
      $number = ldap_errno($connect);

      if ($number == 49) {
        // 49 -> Invalid credentials. Don't keep trying.
        return false;
      }
    }
  }

  // If we got here, all attempts failed; but not b/c of credentials.
  return false;
}

/**
 * HELPER FUNCTION
 *
 * Finds the DN for the given $email. The DN is what we will use to authenticate
 * the user.
 *
 * @param username {String}
 *     The user sAMAccountName.
 *
 * @return {String}
 *     The DN corresponding the the supplied $username.
 */
function _ad_get_dn ($username) {
  $connect = _ad_connect();

  $result_dn = _ad_search($connect, "sAMAccountName=${username}", array('dn'));

  if (count($result_dn) == 1) {
    return $result_dn[0]['dn'];
  } else {
    return null;
  }
}

/**
 * HELPER FUNCTION
 *
 * Gets an array of members (DNs) of the given $groupName.
 *
 * @param $connection {LDAPConnection}
 *     The connection to use to search LDAP
 * @param $groupName {String}
 *     The name of the group to search for members of.
 *
 * @return {Array}
 *     An array of DNs that are a member of the given group.
 */
function _ad_get_group_members ($connection, $groupName) {
  $members = array();

  $results = _ad_search($connection, "sAMAccountName=${groupName}",
      array('member'));

  if (is_array($results) && count($results) == 1) {
    $members = array_keys($results[0]['member']);
  }

  return $members;
}

/**
 * HELPER FUNCTION
 *
 * @param connect {LDAPResource} The connected and bound LDAP connection.
 * @param filter {String} An LDAP query string
 * @param fields {Array} An array of fields to fetch from LDAP. If not
 *      specified, defaults to all fields.
 *
 * @return An array of results where each result contains the values for the
 *      requested fields.
 */
function _ad_search ($connect, $filter, $fields = array('*')) {
  global $CONFIG;

  $results = array();
  $base_dn = $CONFIG['AD_BASE_DN'];
  $ldap_results = ldap_search(array($connect), array($base_dn), $filter, $fields);

  // Loop over results from each of the Base DN scopes
  foreach($ldap_results as $ldap_result) {
    $ldap_entries = ldap_get_entries($connect, $ldap_result);
    if (intval($ldap_entries['count']) != 0) {
      // Matching result found in this Base DN scope (region)
      array_push($results, _ad_build_results($ldap_entries));
    }
  }

  return $results;
}

?>
