/**
 * WordPress dependencies.
 */
import { Button, PanelBody, Spinner, TextareaControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as notesStore } from '../store/';
import './index.scss';

export const NoteForm = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ note, setNote ] = useState( '' );
	const { clearIsCreated, createNote } = useDispatch( notesStore );

	return (
		<PanelBody className="note-form">
			{ isOpen &&
				<>
					<TextareaControl
						label={ __( 'Add a note', 'wporg-internal-notes' ) }
						value={ note }
						onChange={ newValue => setNote( newValue ) }
						rows="2"
						disabled={ isLoading }
					/>
					<div className="note-form__buttons">
						{ isLoading &&
							<Spinner />
						}
						{ ! isLoading &&
							<>
								<Button
									className="note-form__button-cancel"
									text={ __( 'Cancel', 'wporg-internal-notes' ) }
									onClick={ ( event ) => {
										event.preventDefault();
										setIsOpen( false );
									} }
									isSecondary
								/>
								<Button
									className="note-form__button-submit"
									text={ __( 'Submit', 'wporg-internal-notes' ) }
									onClick={ () => {
										setIsLoading( true );
										createNote( {
											excerpt: note,
										} ).then( ( { note } ) => {
											setNote( '' );
											setIsLoading( false );
											setTimeout( () => {
												clearIsCreated( note.id );
											}, 500 );
										} );
									} }
									isPrimary
								/>
							</>
						}
					</div>
				</>
			}
			{ ! isOpen &&
				<Button
					className="note-form__toggle"
					text={ __( 'Add a note', 'wporg-internal-notes' ) }
					onClick={ () => { setIsOpen( true ); } }
					isPrimary
				/>
			}
		</PanelBody>
	);
};


