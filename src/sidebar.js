/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as notesStore } from './store';

const NotesSidebar = () => {
	const { getCurrentPostId, getCurrentPostType } = useSelect( ( select ) => select( 'core/editor' ) );
	const postId = getCurrentPostId();
	const postType = getCurrentPostType();
	const notes = useSelect( ( select ) => select( notesStore ).getNotes( postId, postType ) );
	console.log(notes);

	return (
		<PluginSidebar
			name="wporg-internal-notes-sidebar"
			title={ __( 'Internal Notes', 'wporg-internal-notes' ) }
			icon="book-alt"
		>

		</PluginSidebar>
	);
}

export default NotesSidebar;
