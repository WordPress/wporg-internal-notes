/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { LoadMore } from "./load-more";
import { NoteForm } from './note-form/';
import { NotesList } from './notes-list/';
import { store as notesStore } from "./store";

export const NotesSidebar = () => {
	const initialNotes = useSelect( ( select ) => {
		return select( notesStore ).getNotes();
	} );

	return (
		<PluginSidebar
			name="wporg-internal-notes-sidebar"
			title={ __( 'Internal Notes', 'wporg-internal-notes' ) }
			icon="book-alt"
		>
			<NoteForm />
			<NotesList notes={ initialNotes } />
			<LoadMore />
		</PluginSidebar>
	);
}
