/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { Button } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import './notes-list-item.scss'

export const NotesListItem = ( { className, note } ) => {
	const author = note?._embedded?.author?.[0];
	const dateRelative = note?.date_relative;
	const dateIso = note?.date_gmt;
	const excerpt = note?.excerpt?.rendered;

	if ( ! author || ! dateRelative || ! excerpt ) {
		return(
			<li className={ classnames( 'note note-error', className ) }>
				{ __( 'Missing data.', 'wporg-internal-notes' ) }
			</li>
		);
	}

	const avatarUrl = author.avatar_urls['24'];
	const { slug } = author;

	return (
		<li className={ classnames( 'note', className ) }>
			<header className="note-header">
				<div className="note-author">
					<img className="note-author__avatar" src={ avatarUrl } alt="" />
					<span className="note-author__name">
						<a href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }>
							{ sprintf( '@%s', slug ) }
						</a>
					</span>
				</div>
				<div className="note-date">
					<time title={ dateIso } dateTime={ dateIso }>
						{ dateRelative }
					</time>
				</div>
			</header>
			<RawHTML className="note-excerpt">
				{ excerpt }
			</RawHTML>
		</li>
	);
};
