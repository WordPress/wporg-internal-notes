<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_filter( 'map_meta_cap', __NAMESPACE__ . '\map_meta_caps', 10, 4 );

/**
 * Map primitive caps to our custom caps.
 *
 * @param array  $required_caps
 * @param string $current_cap
 * @param int    $user_id
 * @param mixed  $args
 *
 * @return mixed
 */
function map_meta_caps( $required_caps, $current_cap, $user_id, $args ) {
	switch ( $current_cap ) {
		case 'read-internal-notes':
		case 'create-internal-note':
			$required_caps = array();

			$post = get_post( $args[0] );
			if ( ! $post ) {
				$required_caps[] = 'do_not_allow';
				break;
			}

			$post_type = get_post_type_object( get_post_type( $post ) );
			if ( ! $post_type ) {
				$required_caps[] = 'do_not_allow';
				break;
			}

			if ( ! post_type_supports( $post_type->name, 'wporg-internal-notes' ) ) {
				$required_caps[] = 'do_not_allow';
				break;
			}

			$required_caps[] = $post_type->cap->edit_others_posts;
			break;
	}

	return $required_caps;
}
