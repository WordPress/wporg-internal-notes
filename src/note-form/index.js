/**
 * WordPress dependencies.
 */
import { Button, PanelBody, TextareaControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as noteStore } from '../store/';

export const NoteForm = () => {
	const [ message, setMessage ] = useState( '' );
	const { createNote } = useDispatch( noteStore );

	return (
		<PanelBody className="note-form">
			<TextareaControl
				label={ __( 'Add a note', 'wporg-internal-notes' ) }
				value={ message }
				onChange={ newValue => setMessage( newValue ) }
				rows="2"
			/>
			<Button
				text={ __( 'Submit', 'wporg-internal-notes' ) }
				onClick={ ( event ) => {
					event.preventDefault();
					createNote( {
						message: message,
					} );
				} }
				isPrimary
			/>
		</PanelBody>
	);
};


