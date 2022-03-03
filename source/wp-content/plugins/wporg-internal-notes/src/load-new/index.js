/**
 * WordPress dependencies.
 */
import { PanelBody, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { store as notesStore } from '../store';

export const LoadNew = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ needsRefresh, setNeedsRefresh ] = useState( false );
	const { isSaving, afterDate } = useSelect( ( select ) => {
		const { isSavingPost } = select( 'core/editor' );
		const { getLatestNoteDate } = select( notesStore );

		return {
			isSaving: isSavingPost(),
			afterDate: getLatestNoteDate(),
		}
	} );
	const { prependNotes, clearIsCreated } = useDispatch( notesStore );

	if ( isSaving && ! needsRefresh ) {
		setNeedsRefresh( true );
	} else if ( ! isSaving && needsRefresh ) {
		setNeedsRefresh( false );
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

	return (
		<>
			{ isLoading &&
				<PanelBody className="load-more">
					<Spinner />
				</PanelBody>
			}
		</>
	);
};
