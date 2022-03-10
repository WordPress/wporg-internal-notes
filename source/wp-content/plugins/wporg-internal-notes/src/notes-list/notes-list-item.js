/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { Button } from '@wordpress/components';
import { useRefEffect } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { RawHTML, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as notesStore } from '../store/';
import './notes-list-item.scss';

const DeleteButton = ( { noteId } ) => {
	const [ confirm, setConfirm ] = useState( false );
	const { deleteNote, setIsDeleted } = useDispatch( notesStore );

	// This allows us to avoid the eslint warning against global event listeners.
	const confirmRef = useRefEffect( ( node ) => {
		const { ownerDocument } = node;

		const handleClickOutside = ( event ) => {
			if ( node && ! node.contains( event.target ) ) {
				setConfirm( false );
			}
		};

		ownerDocument.addEventListener( 'mousedown', handleClickOutside );

		return () => {
			ownerDocument.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [] );

	return (
		<>
			{ ! confirm && (
				<Button
					className="wporg-internal-notes__note-button-delete"
					label={ __( 'Delete note', 'wporg' ) }
					icon="trash"
					isSecondary
					onClick={ () => {
						setConfirm( true );
					} }
				/>
			) }
			{ confirm && (
				<Button
					ref={ confirmRef }
					className="wporg-internal-notes__note-button-confirm-delete"
					isDestructive
					onClick={ () => {
						setIsDeleted( noteId );
						setTimeout( () => {
							deleteNote( noteId );
						}, 300 );
					} }
				>
					{ __( 'Delete this note?', 'wporg' ) }
				</Button>
			) }
		</>
	);
};

export const NotesListItem = ( { className, note } ) => {
	const { id: noteId, date_gmt: dateIso, date_relative: dateRelative, type } = note;
	const author = note?._embedded?.author?.[ 0 ];
	const avatarUrl = author?.avatar_urls?.[ '24' ] || '';
	const slug = author?.slug || 'unknown';

	const excerpt = note?.excerpt?.rendered;
	const { isCreated, isDeleted } = useSelect(
		( select ) => {
			const { isCreated: created, isDeleted: deleted } = select( notesStore );

			return {
				isCreated: created( note.id ),
				isDeleted: deleted( note.id ),
			};
		},
		[ note ]
	);

	if ( ! dateRelative || ! excerpt ) {
		return (
			<li className={ classnames( 'wporg-internal-notes__note', 'is-error', className ) }>
				{ __( 'Missing data.', 'wporg' ) }
			</li>
		);
	}

	const classes = classnames(
		'wporg-internal-notes__note',
		{
			'internal-note': 'wporg-internal-note' === type,
			'log-note': 'wporg-log-note' === type,
			'is-created': isCreated,
			'is-deleted': isDeleted,
		},
		className
	);

	if ( 'wporg-log-note' === type ) {
		return (
			<li className={ classes }>
				<RawHTML className="wporg-internal-notes__note-excerpt">{ excerpt }</RawHTML>
				<footer className="wporg-internal-notes__note-footer">
					<time className="wporg-internal-notes__note-date" title={ dateIso } dateTime={ dateIso }>
						{ dateRelative }
					</time>
					<a
						className="wporg-internal-notes__note-author-name"
						href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }
						target="_blank"
						rel="noreferrer"
					>
						{ sprintf( '@%s', slug ) }
					</a>
				</footer>
			</li>
		);
	}

	return (
		<li className={ classes }>
			<header className="wporg-internal-notes__note-header">
				<div className="wporg-internal-notes__note-author">
					{ avatarUrl && (
						<img className="wporg-internal-notes__note-author-avatar" src={ avatarUrl } alt="" />
					) }
					<a
						className="wporg-internal-notes__note-author-name"
						href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }
						target="_blank"
						rel="noreferrer"
					>
						{ sprintf( '@%s', slug ) }
					</a>
				</div>
				<DeleteButton noteId={ noteId } />
			</header>
			<RawHTML className="wporg-internal-notes__note-excerpt">{ excerpt }</RawHTML>
			<footer className="wporg-internal-notes__note-footer">
				<time className="wporg-internal-notes__note-date" title={ dateIso } dateTime={ dateIso }>
					{ dateRelative }
				</time>
			</footer>
		</li>
	);
};
