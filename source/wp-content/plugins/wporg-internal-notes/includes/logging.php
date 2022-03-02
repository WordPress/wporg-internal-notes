<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'post_updated', __NAMESPACE__ . '\post_update', 10, 3 );
add_action( 'transition_post_status', __NAMESPACE__ . '\status_change', 10, 3 );

/**
 * Check if logging has been enabled for a particular feature/change.
 *
 * Available features:
 * - post-update
 * - status-change
 *
 * @param int    $post_id
 * @param string $feature
 *
 * @return bool|mixed
 */
function logging_enabled( $post_id, $feature ) {
	$post_type    = get_post_type( $post_id );
	$all_supports = get_all_post_type_supports( $post_type );
	$enabled      = $all_supports['wporg-log-notes'] ?? false;

	if ( is_array( $enabled ) ) {
		$enabled = $enabled[ $feature ] ?? false;
	}

	return $enabled;
}

/**
 * Add a log entry when a post is updated.
 *
 * @param int      $post_ID
 * @param \WP_Post $post_after
 * @param \WP_Post $post_before
 *
 * @return void
 */
function post_update( $post_ID, $post_after, $post_before ) {
	if ( ! logging_enabled( $post_ID, 'post-update' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$start_statuses = array( 'auto-draft', 'inherit', 'new' );
	if ( in_array( $post_before->post_status, $start_statuses, true ) ) {
		return;
	}

	$diff = array_diff( $post_after->to_array(), $post_before->to_array() );
	$changed_fields = array_keys( $diff );

	$omit_fields = array( 'post_status', 'post_date_gmt', 'post_modified', 'post_modified_gmt' );
	$filtered_changed_fields = array_diff( $changed_fields, $omit_fields );

	if ( empty( $filtered_changed_fields ) ) {
		return;
	}

	$post_type_labels = get_post_type_labels( get_post_type_object( get_post_type( $post_ID ) ) );

	$msg = sprintf(
		__( '%1$s updated. Changed fields: %2$s', 'wporg' ),
		$post_type_labels->singular_name,
		implode( __( ', ', 'wporg' ), $filtered_changed_fields )
	);

	$data = array(
		'post_excerpt' => $msg,
		'post_type'    => LOG_POST_TYPE,
	);

	create_note( $post_ID, $data );
}

/**
 * Add a log entry when a post's status changes.
 *
 * @param string   $new_status
 * @param string   $old_status
 * @param \WP_Post $post
 *
 * @return void
 */
function status_change( $new_status, $old_status, $post ) {
	if ( ! logging_enabled( $post->ID, 'status-change' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$start_statuses = array( 'auto-draft', 'inherit', 'new' );
	if ( in_array( $new_status, $start_statuses, true ) || $new_status === $old_status ) {
		return;
	} else {
		$new = get_post_status_object( $new_status );
		$old = get_post_status_object( $old_status );

		$msg = sprintf(
			__( 'Status changed from %1$s to %2$s.', 'wporg' ),
			$old->label ?: $old_status,
			$new->label ?: $new_status
		);
	}

	$data = array(
		'post_excerpt' => $msg,
		'post_type'    => LOG_POST_TYPE,
	);

	create_note( $post->ID, $data );
}
