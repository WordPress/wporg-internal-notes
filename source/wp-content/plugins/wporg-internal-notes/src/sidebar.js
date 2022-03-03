/**
 * WordPress dependencies.
 */
import { Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { LoadMore } from './load-more';
import { LoadNew } from "./load-new";
import { NoteForm } from './note-form/';
import { NotesList } from './notes-list/';
import { store as notesStore } from './store';
import './sidebar.scss';

const SidebarIcon = () => {
	const { getTotalNotesCount } = useSelect( ( select ) => select( notesStore ) );

	return (
		<div className="wporg-internal-notes__sidebar-icon">
			<span className="note-count">{ getTotalNotesCount().toLocaleString() }</span>
			<Icon icon="edit-page" />
		</div>
	);
};

export const NotesSidebar = () => {
	const initialNotes = useSelect( ( select ) => {
		return select( notesStore ).getNotes();
	} );

	return (
		<PluginSidebar
			name="wporg-internal-notes__sidebar"
			className="wporg-internal-notes__sidebar"
			title={ __( 'Internal Notes', 'wporg' ) }
			icon={ <SidebarIcon /> }
		>
			<NoteForm />
			<LoadNew />
			<NotesList notes={ initialNotes } />
			<LoadMore />
		</PluginSidebar>
	);
};
