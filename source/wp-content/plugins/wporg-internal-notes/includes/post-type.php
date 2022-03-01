<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Constants.
 */
const NOTE_POST_TYPE = 'wporg-internal-note';
const LOG_POST_TYPE = 'wporg-log-note';

/**
 * Actions and filters.
 */
add_action( 'init', __NAMESPACE__ . '\register_cpts' );

/**
 * Register the custom post type.
 *
 * @return void
 */
function register_cpts() {
	register_post_type(
		NOTE_POST_TYPE,
		array(
			'label'            => __( 'Internal Notes', 'wporg' ),
			'labels'           => array(
				'singular_name' => __( 'Internal Note', 'wporg' ),
			),
			'public'           => false,
			'show_in_rest'     => false,
			'capabilities'     => array(
				'create-note',
				'delete-note',
				'read-notes',
			),
			'supports'         => array( 'author', 'excerpt' ),
			'can_export'       => false,
			'delete_with_user' => false,
		)
	);

	register_post_type(
		LOG_POST_TYPE,
		array(
			'label'            => __( 'Log Notes', 'wporg' ),
			'labels'           => array(
				'singular_name' => __( 'Log Note', 'wporg' ),
			),
			'public'           => false,
			'show_in_rest'     => false,
			'capabilities'     => array(
				'create-note',
				'delete-note',
				'read-notes',
			),
			'supports'         => array( 'author', 'excerpt' ),
			'can_export'       => false,
			'delete_with_user' => false,
		)
	);
}

/**
 * Get an array of post types for this plugin.
 *
 * @return string[]
 */
function get_note_post_types() {
	return array( NOTE_POST_TYPE, LOG_POST_TYPE );
}

/**
 * Get an array of internal notes or the query object for the notes for a particular post.
 *
 * @param int   $post_id    The ID of the parent post of the notes.
 * @param array $query_args Optional. Additional query args.
 * @param bool  $wp_query   Optional. True to return a WP_Query object instead of an array of post objects.
 *
 * @return array|\WP_Query
 */
function get_notes( $post_id, $query_args = array(), $wp_query = false ) {
	$post_types = get_note_post_types();

	$query_args = wp_parse_args(
		$query_args,
		array(
			'order'     => 'desc',
			'post_type' => $post_types,
		)
	);

	$query_args['post_type']   = array_intersect( $post_types, (array) $query_args['post_type'] ) ?: $post_types;
	$query_args['post_parent'] = $post_id;
	$query_args['post_status'] = 'private';

	$query = new \WP_Query( $query_args );

	if ( true === $wp_query ) {
		return $query;
	}

	return $query->get_posts();
}

/**
 * Create a new note for a particular post.
 *
 * @param int   $post_id   The ID of the parent post of the note.
 * @param array $note_data The contents of the note.
 *
 * @return int|\WP_Error
 */
function create_note( $post_id, $note_data ) {
	$post_types = get_note_post_types();

	$note_data = wp_parse_args(
		$note_data,
		array(
			'post_author'  => get_current_user_id(),
			'post_excerpt' => '',
			'post_type'    => NOTE_POST_TYPE,
		)
	);

	$note_data['post_type']   = in_array( $note_data['post_type'], $post_types, true ) ? $note_data['post_type'] : NOTE_POST_TYPE;
	$note_data['post_parent'] = $post_id;
	$note_data['post_status'] = 'private';

	return wp_insert_post( wp_slash( $note_data ), true );
}

/**
 * Permanently delete a note.
 *
 * Note that log notes should never be deleted.
 *
 * @param int $note_id The ID of the note post.
 *
 * @return bool|\WP_Error
 */
function delete_note( $note_id ) {
	if ( NOTE_POST_TYPE !== get_post_type( $note_id ) ) {
		return new \WP_Error(
			'invalid_post',
			__( 'Could not delete object because it is not a note.', 'wporg' )
		);
	}

	$result = wp_delete_post( $note_id, true );

	if ( ! $result instanceof \WP_Post ) {
		return new \WP_Error(
			'delete_failed',
			__( 'The note could not be deleted.', 'wporg' )
		);
	}

	return true;
}
