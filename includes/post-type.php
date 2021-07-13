<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Constants.
 */
const POST_TYPE = 'wporg-internal-note';

/**
 * Actions and filters.
 */
add_action( 'init', __NAMESPACE__ . '\register_cpt' );

/**
 * Register the custom post type.
 *
 * @return void
 */
function register_cpt() {
	register_post_type(
		POST_TYPE,
		array(
			'label'            => __( 'Internal Notes', 'wporg-internal-notes' ),
			'public'           => false,
			'show_in_rest'     => false,
			'capabilities'     => array(
				'create-internal-note',
				'delete-internal-note',
				'read-internal-notes',
			),
			'supports'         => array( 'author', 'excerpt' ),
			'can_export'       => false,
			'delete_with_user' => false,
		)
	);
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
	$query_args = wp_parse_args(
		$query_args,
		array(
			'order' => 'desc',
		)
	);

	$query_args['post_type']   = POST_TYPE;
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
	$note_data = wp_parse_args(
		$note_data,
		array(
			'post_author'  => get_current_user_id(),
			'post_excerpt' => '',
		)
	);

	$note_data['post_type']   = POST_TYPE;
	$note_data['post_parent'] = $post_id;
	$note_data['post_status'] = 'private';

	return wp_insert_post( wp_slash( $note_data ), true );
}

/**
 * Permanently delete a note.
 *
 * @param int $note_id The ID of the note post.
 *
 * @return bool|\WP_Error
 */
function delete_note( $note_id ) {
	if ( POST_TYPE !== get_post_type( $note_id ) ) {
		return new \WP_Error(
			'invalid_post',
			__( 'Could not delete object because it is not a note.', 'wporg-internal-notes' )
		);
	}

	$result = wp_delete_post( $note_id, true );

	if ( ! $result instanceof \WP_Post ) {
		return new \WP_Error(
			'delete_failed',
			__( 'The note could not be deleted.', 'wporg-internal-notes' )
		);
	}

	return true;
}
