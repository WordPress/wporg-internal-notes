/**
 * WordPress dependencies.
 */
import { Button, PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as notesStore } from "../store";

export const LoadMore = () => {
	const counts = useSelect( ( select ) => {
		const { getCurrentNotesCount, getTotalNotesCount } = select( notesStore );

		return {
			current: getCurrentNotesCount(),
			total: getTotalNotesCount(),
		};
	} );
	const { appendNotes } = useDispatch( notesStore );

	return (
		<>
			{ counts.total > counts.current &&
				<PanelBody className="load-more">
					<Button
						className="load-more-button"
						text={ __( 'Load older notes', 'wporg-internal-notes' ) }
						isSecondary
						onClick={ () => {
							appendNotes( counts.current );
						} }
					/>
				</PanelBody>
			}
		</>
	);
}
