/**
 * WordPress dependencies.
 */
import { Button, Notice, PanelBody, PanelRow, Spinner, TextareaControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { NotesFilter } from '../notes-filter/';
import { store as notesStore } from '../store/';
import './index.scss';

export const NoteForm = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ note, setNote ] = useState( '' );
	const { clearIsCreated, createNote } = useDispatch( notesStore );
	const currentFilter = useSelect( ( select ) => {
		return select( notesStore ).getFilter();
	} );

	return (
		<PanelBody className="wporg-internal-notes__note-form">
			{ isOpen && (
				<>
					{ 'wporg-log-note' === currentFilter &&
						<Notice
							status="warning"
							isDismissible={ false }
						>
							{ __( 'Internal notes are currently hidden by the filter.', 'wporg' ) }
						</Notice>
					}
					<TextareaControl
						className="wporg-internal-notes__note-form-textarea"
						label={ __( 'Add a note', 'wporg' ) }
						value={ note }
						onChange={ ( newValue ) => setNote( newValue ) }
						rows="2"
						disabled={ isLoading }
					/>
					<div className="wporg-internal-notes__note-form-buttons">
						{ isLoading && <Spinner /> }
						{ ! isLoading && (
							<>
								<Button
									className="wporg-internal-notes__note-form-button-cancel"
									text={ __( 'Cancel', 'wporg' ) }
									onClick={ ( event ) => {
										event.preventDefault();
										setIsOpen( false );
									} }
									isSecondary
								/>
								<Button
									className="wporg-internal-notes__note-form-button-submit"
									text={ __( 'Submit', 'wporg' ) }
									onClick={ () => {
										if ( ! note.length ) {
											return;
										}

										setIsLoading( true );
										createNote( {
											excerpt: note,
										} ).then( ( { note: createdNote } ) => {
											setNote( '' );
											setIsLoading( false );
											setTimeout( () => {
												clearIsCreated( createdNote.id );
											}, 300 );
										} );
									} }
									isPrimary
								/>
							</>
						) }
					</div>
				</>
			) }
			{ ! isOpen && (
				<PanelRow>
					<Button
						className="wporg-internal-notes__note-form-button-toggle"
						text={ __( 'Add a note', 'wporg' ) }
						onClick={ () => {
							setIsOpen( true );
						} }
						isPrimary
					/>
					<NotesFilter />
				</PanelRow>
			) }
		</PanelBody>
	);
};
