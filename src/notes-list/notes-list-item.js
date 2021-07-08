/**
 * WordPress dependencies.
 */
import { PanelRow } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import './notes-list-item.scss'

export const NotesListItem = ( { note } ) => {
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
	const { slug } = author;

	return (
		<li className="note">
			<div className="note-timestamp">{ timestamp }</div>
			<div className="note-author">
				<img className="note-author__avatar" src={ avatarUrl } alt="" />
				<span className="note-author__name">
					<a href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }>
						{ sprintf( '@%s', slug ) }
					</a>
				</span>
			</div>
			<RawHTML className="note-message">
				{ message }
			</RawHTML>
		</li>
	);
};
