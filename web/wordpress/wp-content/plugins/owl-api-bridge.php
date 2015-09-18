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

/*
 * This part of this plugin exposes an XML RPC method that allows the OWL API
 * to validate a WordPress authentication cookie.
 */

/**
 * Validates a WordPress `logged_in_*` authentication cookie.
 *
 * Exposed as an XML-RPC method.
 *
 * @param string $cookie
 *     Value of the WordPress `logged_in_*` cookie.
 * @param string $scheme
 * @return boolean
 *     Whether the cookie is valid.
 */
function owl_validateAuthCookie($cookie, $scheme = 'logged_in')
{
    return wp_validate_auth_cookie($cookie, $scheme);
}

/**
 * Returns some information on the specified user.
 *
 * Exposed as an XML-RPC method.
 *
 * @param string $username
 *     The user ID.
 * @return array|boolean
 *     An array whose keys are 'admin' and 'id' and whose values are
 *     respectively a boolean telling whether the user is a WP admin and the
 *     user ID of the user. Returns false if the user could not be found or if
 *     an error occurred.
 */
function owl_getUserInfo($username)
{
    $args = array(
        'search'         => $username,
        'search_columns' => [ 'user_login' ]
    );
    $userQuery = new WP_User_Query($args);

    if (1 !== count($userQuery->results)) {
        return false;
    } else {
        return array(
            'id'    => $userQuery->results[0]->ID,
            'admin' => in_array('administrator', $userQuery->results[0]->roles)
        );
    }
}

/**
 * Registers a new XML-RPC methods,
 *
 * @param array $methods
 *     Methods array.
 * @return array
 *     Methods array.
 */
function owl_new_xmlrpc_methods($methods)
{
    $methods['owl.validateAuthCookie'] = 'owl_validateAuthCookie';
    $methods['owl.getUserInfo'] = 'owl_getUserInfo';

    return $methods;
}

add_filter('xmlrpc_methods', 'owl_new_xmlrpc_methods');

/**
 * Provides an AJAX endpoint for the username autocomplete functionality of the
 * add/edit patch form.
 */
function owl_usernameAutocomplete()
{

    global $wpdb;

    $pattern = $_POST['q'];

    $args = array(
        'search_columns' => array( 'nickname' ),
        'orderby' => 'nickname',
        'order' => 'ASC',
        'meta_query' => array(
            array(
                'key'     => 'nickname',
                'value'   => $pattern,
                'compare' => 'LIKE',
            ),
        ), 'count_total' => true,
    );
    $userQuery = new WP_User_Query($args);

    $result = array(
        //'total_count' => ?,
        'incomplete_results' => false,
            'items' => array(
            //array(
            //    'id' => 1,
            //    'text' => 'Samuele',
            //),
        )
    );

    //$result['total_count'] = count($users);
    $result['items'] = $userQuery->results;

    wp_send_json($result);
    wp_die();
}

add_action('wp_ajax_owl-username-autocomplete', 'owl_usernameAutocomplete');
add_action('wp_ajax_nopriv_owl-username-autocomplete', 'owl_usernameAutocomplete');

/**
 * Provides an AJAX endpoint for retrieving WordPress's authentication cookie.
 */
function owl_getAuthCookie()
{
    $cookies = $_COOKIE;
    $result = null;
    $cookieSig = 'wordpress_logged_in_';
    foreach ($cookies as $name => $value) {
        if (substr($name, 0, strlen($cookieSig)) === $cookieSig) {
            $result = $value;
            break;
        }
    }

    wp_send_json($result);
    wp_die();
}

add_action('wp_ajax_owl-get-auth-cookie', 'owl_getAuthCookie');
add_action('wp_ajax_nopriv_owl-get-auth-cookie', 'owl_getAuthCookie');

// EOF
