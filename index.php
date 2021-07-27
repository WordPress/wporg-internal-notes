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
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_editor_assets' );

/**
 * Load PHP files.
 *
 * @return void
 */
function load() {
	require_once PLUGIN_DIR . 'includes/capabilities.php';
	require_once PLUGIN_DIR . 'includes/class-rest-controller.php';
	require_once PLUGIN_DIR . 'includes/post-type.php';
}

/**
 * Turn on the API.
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

/**
 * Set up scripts and styles for the block editor.
 *
 * @return void
 */
function enqueue_editor_assets() {
	global $post, $typenow;

	$supported_types = get_post_types_by_support( SLUG );
	if ( ! in_array( $typenow, $supported_types ) ) {
		return;
	}

	if ( ! current_user_can( 'read-internal-notes', $post->ID ) ) {
		return;
	}

	$script_asset_path = __DIR__ . '/build/index.asset.php';
	if ( ! is_readable( $script_asset_path ) ) {
		wp_die( esc_html__( 'You need to run `npm start` or `npm build` to build the assets.', 'wporg-internal-notes' ) );
	}

	$script_asset = require( $script_asset_path );
	wp_enqueue_script(
		'wporg-internal-notes',
		plugins_url( 'build/index.js', __FILE__ ),
		$script_asset['dependencies'],
		$script_asset['version'],
		true
	);

	wp_enqueue_style(
		'wporg-internal-notes',
		plugins_url( 'build/index.css', __FILE__ ),
		array(),
		$script_asset['version']
	);
}
