/**
 * WordPress dependencies.
 */
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import NotesList from './notes-list/';

const NotesSidebar = () => {
	return (
		<PluginSidebar
			name="wporg-internal-notes-sidebar"
			title={ __( 'Internal Notes', 'wporg-internal-notes' ) }
			icon="book-alt"
		>
			<NotesList />
		</PluginSidebar>
	);
}

export default NotesSidebar;
