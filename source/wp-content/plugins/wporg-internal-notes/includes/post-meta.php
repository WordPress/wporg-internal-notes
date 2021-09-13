<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Constants.
 */
const META_KEY = 'wporg-internal-note';

/**
 * Get an array of internal notes or the count of notes for a post.
 *
 * @param int   $post_id
 * @param array $args
 *
 * @return array|int
 */
function get_notes( $post_id, $args ) {
	$args = wp_parse_args(
		$args,
		array(
			'count_only' => false,
			'order'      => 'desc',
			'page'       => 1,
			'per_page'   => 10,
		)
	);

	$notes = get_post_meta( $post_id, META_KEY, false );

	if ( false === $notes ) {
		$notes = array();
	}

	if ( true === $args['count_only'] ) {
		return count( $notes );
	}

	usort(
		$notes,
		function( $a, $b ) use ( $args ) {
			$atime = $a['timestamp'];
			$btime = $b['timestamp'];

			if ( $atime === $btime ) {
				return 0;
			}

			switch ( strtolower( $args['order'] ) ) {
				case 'desc':
				default:
					$return = ( $a > $b ) ? -1 : 1;
					break;
				case 'asc':
					$return = ( $a < $b ) ? -1 : 1;
					break;
			}

			return $return;
		}
	);

	$notes = array_slice(
		$notes,
		( $args['page'] - 1 ) * ( $args['per_page'] + 1 ),
		$args['per_page']
	);

	return $notes;
}

/**
 * Add a new internal note.
 *
 * @param int   $post_id
 * @param array $args
 *
 * @return int|false
 */
function add_note( $post_id, $args ) {
	$args = wp_parse_args(
		$args,
		array(
			'author'    => get_current_user_id(),
			'timestamp' => time(),
			'message'   => '',
		)
	);

	return add_post_meta( $post_id, META_KEY, $args );
}
