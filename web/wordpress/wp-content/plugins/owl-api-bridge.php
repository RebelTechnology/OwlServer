<?php
/**
 * Plugin Name: OWL API Bridge
 * Plugin URI:  https://github.com/pingdynasty/OwlServer
 * Description: Provides an XML RPC method that allows the OWL API to validate a WordPress authentication cookie.
 * Version:     1.0.0
 * Author:      Sam Artuso <sam@highoctanedev.co.uk>
 * Author URI:  http://www.hoxtonowl.com/
 * License:     WTFPL 2.0 http://www.wtfpl.net/
 */

defined('ABSPATH') or die('No script kiddies please!');

define('DOING_AJAX', true);

function owl_validateAuthCookie($cookie, $scheme = 'logged_in') {
    return wp_validate_auth_cookie($cookie, $scheme);
}

function owl_isAdmin($userID) {

}

function owl_new_xmlrpc_methods($methods) {
    $methods['owl.validateAuthCookie'] = 'owl_validateAuthCookie';
    return $methods;
}
add_filter('xmlrpc_methods', 'owl_new_xmlrpc_methods');

// EOF