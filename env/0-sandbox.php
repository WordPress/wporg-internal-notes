<?php

add_filter( 'wp_is_application_passwords_available', '__return_true' );

add_post_type_support( 'post', 'wporg-internal-notes' );

/**
 * Proof of concept for adding log notes.
 *
 * @param string $new_status
 * @param string $old_status
 * @param \WP_Post $post
 *
 * @return void
 */
function wporg_log_post_status_changes( $new_status, $old_status, $post ) {
	if ( ! post_type_supports( $post->post_type, 'wporg-internal-notes' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( $new_status === $old_status ) {
		return;
	}

	$new = get_post_status_object( $new_status );
	$old = get_post_status_object( $old_status );

	$msg = sprintf(
		'Status changed from %1$s to %2$s.',
		$old->label ?: $old_status,
		$new->label ?: $new_status
	);

	$data = array(
		'post_excerpt' => $msg,
		'post_type'    => \WordPressdotorg\InternalNotes\LOG_POST_TYPE,
	);

	\WordPressdotorg\InternalNotes\create_note( $post->ID, $data );
}
add_action( 'transition_post_status', 'wporg_log_post_status_changes', 10, 3 );
