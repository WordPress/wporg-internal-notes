<?php
/**
 * Plugin name: Internal Notes
 * Plugin URI:  https://wordpress.org
 * Description: Enables adding internal notes to supporting post types on WordPress.org.
 * Version:     0.1
 * Author:      WordPress.org
 * Author URI:  http://wordpress.org/
 * License:     GPLv2 or later
 * Text Domain: wporg-internal-notes
 */

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Constants.
 */
define( __NAMESPACE__ . '\PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( __NAMESPACE__ . '\PLUGIN_URL', plugins_url( '/', __FILE__ ) );
const SLUG = 'wporg-internal-notes';

/**
 * Actions and filters.
 */
add_action( 'plugins_loaded', __NAMESPACE__ . '\load' );
add_action( 'rest_api_init', __NAMESPACE__ . '\initialize_rest_endpoints' );

/**
 * Load PHP files.
 *
 * @return void
 */
function load() {
	require_once PLUGIN_DIR . 'includes/class-rest-controller.php';
	require_once PLUGIN_DIR . 'includes/post-meta.php';
}

/**
 * Turn on API.
 *
 * @return void
 */
function initialize_rest_endpoints() {
	$supported_types = get_post_types_by_support( SLUG );

	foreach ( $supported_types as $post_type ) {
		$object = get_post_type_object( $post_type );
		if ( true === $object->show_in_rest ) {
			$controller = new REST_Controller( $post_type );
			$controller->register_routes();
		}
	}
}
