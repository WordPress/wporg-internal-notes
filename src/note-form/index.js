/**
 * WordPress dependencies.
 */
import { Button, PanelBody, TextareaControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as noteStore } from '../store/';
import './index.scss';

export const NoteForm = () => {
	const [ isAdding, setIsAdding ] = useState( false );
	const [ message, setMessage ] = useState( '' );
	const { createNote } = useDispatch( noteStore );

	return (
		<PanelBody className="note-form">
			{ isAdding &&
				<>
					<TextareaControl
						label={ __( 'Add a note', 'wporg-internal-notes' ) }
						value={ message }
						onChange={ newValue => setMessage( newValue ) }
						rows="2"
					/>
					<div className="note-form__buttons">
						<Button
							className="note-form__button-cancel"
							text={ __( 'Cancel', 'wporg-internal-notes' ) }
							onClick={ ( event ) => {
								event.preventDefault();
								setIsAdding( false );
							} }
							isSecondary
						/>
						<Button
							className="note-form__button-submit"
							text={ __( 'Submit', 'wporg-internal-notes' ) }
							onClick={ ( event ) => {
								event.preventDefault();
								createNote( {
									message: message,
								} );
								setMessage( '' );
							} }
							isPrimary
						/>
					</div>
				</>
			}
			{ ! isAdding &&
				<Button
					className="note-form__toggle"
					text={ __( 'Add a note', 'wporg-internal-notes' ) }
					onClick={ ( event ) => {
						event.preventDefault();
						setIsAdding( true );
					} }
					isPrimary
				/>
			}
		</PanelBody>
	);
};


