/**
 * WordPress dependencies.
 */
import { Icon, PanelBody, Spinner } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { LoadMore } from './load-more';
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
	const { initialNotes, afterDate, isSaving } = useSelect( ( select ) => {
		return {
			initialNotes: select( notesStore ).getNotes(),
			afterDate: select( notesStore ).getLatestNoteDate(),
			isSaving: select( 'core/editor' ).isSavingPost(),
		};
	} );
	const { prependNotes, clearIsCreated } = useDispatch( notesStore );
	const prevIsSaving = usePrevious( isSaving );
	const [ isLoading, setIsLoading ] = useState( false );

	// Update the notes list when new notes are created, even if the sidebar is closed.
	useEffect( () => {
		// Gutenberg doesn't have a specific way to check whether the post was just saved, so we store the
		// previous value of isSaving and when isSaving goes from true -> false, we prepend the notes.
		const postWasJustSaved = prevIsSaving && ! isSaving;
		if ( postWasJustSaved ) {
			setIsLoading( true );
			prependNotes( afterDate ).then( ( { notes } ) => {
				setIsLoading( false );
				setTimeout( () => {
					notes.forEach( ( note ) => {
						clearIsCreated( note.id );
					} );
				}, 300 );
			} );
		}
	}, [ isSaving, prevIsSaving ] );

	return (
		<PluginSidebar
			name="wporg-internal-notes__sidebar"
			className="wporg-internal-notes__sidebar"
			title={ __( 'Internal Notes', 'wporg' ) }
			icon={ <SidebarIcon /> }
		>
			<NoteForm />
			{ isLoading &&
				<PanelBody>
					<Spinner />
				</PanelBody>
			}
			<NotesList notes={ initialNotes } />
			<LoadMore />
		</PluginSidebar>
	);
};
