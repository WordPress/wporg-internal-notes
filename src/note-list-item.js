/**
 * WordPress dependencies.
 */
import { PanelRow } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const NoteListItem = ( { note } ) => {
	const author = note?._embedded?.author?.[0];
	const timestamp = note?.timestamp?.rendered;
	const message = note?.message?.rendered;

	if ( ! author || ! timestamp || ! message ) {
		return(
			<PanelRow>
				{ __( 'Missing data.', 'wporg-internal-notes' ) }
			</PanelRow>
		);
	}

	const avatarUrl = author.avatar_urls['24'];
	const { name } = author;

	return (
		<PanelRow>
			<img src={ avatarUrl } alt="" />
			<span>{ name }</span>
			<span>{ timestamp }</span>
			<RawHTML>
				{ message }
			</RawHTML>
		</PanelRow>
	);
};

export default NoteListItem;
