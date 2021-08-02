/**
 * WordPress dependencies.
 */
import { Button, PanelBody, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as notesStore } from '../store';

export const LoadMore = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const counts = useSelect( ( select ) => {
		const { getCurrentNotesCount, getTotalNotesCount } = select( notesStore );

		return {
			current: getCurrentNotesCount(),
			total: getTotalNotesCount(),
		};
	} );
	const { appendNotes, clearIsCreated } = useDispatch( notesStore );

	return (
		<>
			{ counts.total > counts.current && (
				<PanelBody className="load-more">
					<>
						{ isLoading && <Spinner /> }
						{ ! isLoading && (
							<Button
								className="wporg-internal-notes__button-load-more"
								text={ __( 'Load older notes', 'wporg-internal-notes' ) }
								isSecondary
								onClick={ () => {
									setIsLoading( true );
									appendNotes( counts.current ).then( ( { notes } ) => {
										setTimeout( () => {
											notes.forEach( ( note ) => {
												clearIsCreated( note.id );
											} );
											setIsLoading( false );
										}, 300 );
									} );
								} }
							/>
						) }
					</>
				</PanelBody>
			) }
		</>
	);
};
