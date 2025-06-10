<?php
namespace WordPressdotorg\InternalNotes;
/**
 * Classic Editor support for the plugin.
 *
 * Please note: This is not intended to be polished, only absolute minimal functional.
 */

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'edit_form_top', __NAMESPACE__ . '\register_meta_box', 10, 1 );

/**
 * Register the meta box for the classic editor.
 *
 * @return void
 */
function register_meta_box( $post = null ) {
	if (
		! $post ||
		use_block_editor_for_post( $post ) ||
		! in_array( $post->post_type, get_post_types_by_support( SLUG ) ) ||
		! current_user_can( 'read-notes', $post->ID )
	) {
		return;
	}

	add_meta_box(
		'internal-notes',
		__( 'Internal Notes', 'wporg' ),
		__NAMESPACE__ . '\render_meta_box',
		$post->post_type,
		'side',
		'high'
	);
}

/**
 * Render the meta box.
 *
 * @param \WP_Post $post The post object.
 *
 * @return void
 */
function render_meta_box( $post ) {
	if ( ! current_user_can( 'read-notes', $post->ID ) ) {
		return;
	}
	enqueue_editor_assets();

	$notes = get_notes( $post->ID );

	/*
	 * HTML Structure has been copied from the block editor's sidebar.
	 *
	 * CSS is just to make it pretty.
	 * JavaScript is basic functionality.
	 */
	?>
	<div class="wporg-internal-notes__sidebar components-panel">
		<div class="components-panel__body wporg-internal-notes__note-form is-opened">
			<div class="classic-form-add-note components-panel__row">
				<button type="button" class="button wporg-internal-notes__note-form-button-toggle button-primary"><?php _e( 'Add a note', 'wporg' ); ?></button>
			</div>
			<div class="classic-form-add components-base-control wporg-internal-notes__note-form-textarea flexhidden">
				<div class="components-base-control__field">
					<label class="components-base-control__label" for="inspector-textarea-control-1">
						<?php _e( 'Add a note', 'wporg' ); ?>
					</label>
					<textarea class="components-textarea-control__input" id="inspector-textarea-control-1" rows="4" cols="80"></textarea>
				</div>
			</div>
			<div class="classic-form-add wporg-internal-notes__note-form-buttons flexhidden">
				<button 
					type="button" 
					class="button wporg-internal-notes__note-form-button-cancel">
					<?php _e( 'Cancel', 'wporg' ); ?>
				</button>
				<button 
					type="button" 
					class="button wporg-internal-notes__note-form-button-submit button-primary">
					<?php _e( 'Submit', 'wporg' ); ?>
				</button>
			</div>
		</div>
		<ul class="wporg-internal-notes__notes-list filter-all">
			<?php foreach ( $notes as $note ) : ?>
				<li class="wporg-internal-notes__note internal-note" data-id="<?php echo esc_attr( $note->ID ); ?>">
					<header class="wporg-internal-notes__note-header">
						<div class="wporg-internal-notes__note-author">
							<?php echo get_avatar( $note->post_author, 24, '', '', array( 'class' => 'wporg-internal-notes__note-author-avatar' ) ); ?>
							<a class="wporg-internal-notes__note-author-name" href="<?php echo esc_url( get_author_posts_url( $note->post_author ) ); ?>" target="_blank" rel="noreferrer">
								@<?php echo esc_html( get_the_author_meta( 'display_name', $note->post_author ) ); ?>
							</a>
						</div>
						<button type="button" class="wporg-internal-notes__note-button-delete has-icon" aria-label="<?php esc_attr_e( 'Delete note', 'wporg' ); ?>">
							<span class="dashicon dashicons dashicons-trash"></span>
						</button>
					</header>
					<div class="wporg-internal-notes__note-excerpt">
						<p><?php echo wpautop( esc_html( $note->post_excerpt ) ); ?></p>
					</div>
					<footer class="wporg-internal-notes__note-footer">
						<time class="wporg-internal-notes__note-date" title="<?php echo esc_attr( $note->post_date_gmt ); ?>" datetime="<?php echo esc_attr( $note->post_date_gmt ); ?>">
							<?php echo esc_html( human_time_diff( strtotime( $note->post_date_gmt ), current_time( 'timestamp' ) ) . ' ago' ); ?>
						</time>
					</footer>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<style>
		.wporg-internal-notes__note-form .flexhidden {
			display: none;
		}
		.wporg-internal-notes__note-form-textarea label {
			display: block;
			margin-bottom: 0.5em;
			font-weight: bold;
			box-sizing: border-box;
		}
		.wporg-internal-notes__note-form-textarea,
		.wporg-internal-notes__note-form-textarea textarea {
			resize: both;
			width: 100%;
		}
	</style>
	<script>
		<?php
			$post_type_object = get_post_type_object( $post->post_type );
			$api_path         = '/wporg/v1/' . ( $post_type_object->rest_base ?: $post_type_object->name ) . '/' . $post->ID . '/internal-notes';
		?>
		(function($){
			var $holder = $('.wporg-internal-notes__sidebar'),
				$addNoteButton = $holder.find('.classic-form-add-note button' ),
				$cancelAddNoteButton = $holder.find('.wporg-internal-notes__note-form-button-cancel' ),
				$submitAddNoteButton = $holder.find('.wporg-internal-notes__note-form-button-submit' );

			$addNoteButton.on('click', function() {
				$holder.find('.classic-form-add, .classic-form-add-note').toggleClass( 'flexhidden' );
			});
			$cancelAddNoteButton.on('click', function() {
				$holder.find('.classic-form-add, .classic-form-add-note').toggleClass( 'flexhidden' );
			});
			$submitAddNoteButton.on('click', function() {
				var $textarea = $holder.find('.wporg-internal-notes__note-form-textarea textarea'),
					content = $textarea.val().trim();

				if ( ! content ) {
					return;
				}

				wp.apiFetch( {
					path: <?php echo json_encode( $api_path ); ?>,
					method: 'POST',
					data: {
						excerpt: content,
					},
				}).then( function( response ) {
					if ( response && response.id ) {
						$cancelAddNoteButton.trigger('click');
						$textarea.val('');

						// Add the new note to the list.
						var $newNote = $( '<li class="wporg-internal-notes__note internal-note" data-id="' + response.id + '">' +
							'<header class="wporg-internal-notes__note-header">' +
								'<div class="wporg-internal-notes__note-author">' +
									"<?php echo get_avatar( get_current_user_id(), 24, '', '', array( 'class' => 'wporg-internal-notes__note-author-avatar' ) ); ?>" +
									'<a class="wporg-internal-notes__note-author-name" href="<?php echo esc_url( get_author_posts_url( get_current_user_id() ) ); ?>" target="_blank" rel="noreferrer">' +
										'@<?php echo esc_html( get_the_author_meta( 'display_name', get_current_user_id() ) ); ?>' +
									'</a>' +
								'</div>' +
								'<button type="button" class="wporg-internal-notes__note-button-delete has-icon" aria-label="<?php esc_attr_e( 'Delete note', 'wporg' ); ?>">' +
									'<span class="dashicon dashicons dashicons-trash"></span>' +
								'</button>' +
							'</header>' +
							'<div class="wporg-internal-notes__note-excerpt">' + response.excerpt.rendered + '</div>' +
							'<footer class="wporg-internal-notes__note-footer">' +
								'<time class="wporg-internal-notes__note-date" title="' + response.date_gmt + '" datetime="' + response.date_gmt + '">' +
									response.date_relative +
								'</time>' +
							'</footer>' +
							'</li>' );
						$holder.find('.wporg-internal-notes__notes-list').prepend( $newNote );
					} else {
						alert( '<?php echo esc_js( __( 'There was an error adding the note.', 'wporg' ) ); ?>' );
						$textarea.prop('disabled', false);
					}
				}).catch( function( error ) {
					console.error( error );
					alert( '<?php echo esc_js( __( 'There was an error adding the note.', 'wporg' ) ); ?>' );
					$textarea.prop('disabled', false);
				});
			});

			$holder.on('click', '.wporg-internal-notes__note-button-delete', function() {
				var $note = $(this).closest('.wporg-internal-notes__note'),
					noteId = $note.data('id');

				if ( ! noteId || ! confirm( '<?php echo esc_js( __( 'Are you sure you want to delete this note?', 'wporg' ) ); ?>' ) ) {
					return;
				}

				wp.apiFetch( {
					path: <?php echo json_encode( $api_path); ?> + '/' + noteId,
					method: 'DELETE',
				} ).then( function( response ) {
					if ( response && response.deleted ) {
						// Remove the note from the list.
						$note.remove();
					} else {
						alert( '<?php echo esc_js( __( 'There was an error deleting the note.', 'wporg' ) ); ?>' );
					}
				}).catch( function( error ) {
					console.error( error );
					alert( '<?php echo esc_js( __( 'There was an error deleting the note.', 'wporg' ) ); ?>' );
				});
			} );

		})(jQuery);
	</script>
	<?php	
}
