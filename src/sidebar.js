/**
 * WordPress dependencies.
 */
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { NoteForm } from './note-form/';
import { NotesList } from './notes-list/';

export const NotesSidebar = () => {
	return (
		<PluginSidebar
			name="wporg-internal-notes-sidebar"
			title={ __( 'Internal Notes', 'wporg-internal-notes' ) }
			icon="book-alt"
		>
			<NoteForm />
			<NotesList />
		</PluginSidebar>
	);
}
