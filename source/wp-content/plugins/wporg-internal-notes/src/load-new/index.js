/**
 * WordPress dependencies.
 */
import { PanelBody, Spinner } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';


/**
 * Internal dependencies.
 */
import { store as notesStore } from '../store';

export const LoadNew = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const { isSaving, afterDate } = useSelect( ( select ) => {
		const { isSavingPost } = select( 'core/editor' );
		const { getLatestNoteDate } = select( notesStore );

		return {
			isSaving: isSavingPost(),
			afterDate: getLatestNoteDate(),
		};
	} );
	const { prependNotes, clearIsCreated } = useDispatch( notesStore );
	const prevIsSaving = usePrevious(isSaving);

	useEffect( () => {
		// Gutenberg doesn't have a specific way to check whether the post was just saved,
		// so we store the previous value of isSaving and when isSaving goes from true -> false, we prepend the notes.
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
	}, [ isSaving ] );

	return (
		<>
			{ isLoading && (
				<PanelBody className="load-more">
					<Spinner />
				</PanelBody>
			) }
		</>
	);
};
