/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { RawHTML, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as notesStore } from '../store/';
import './notes-list-item.scss'

const DeleteButton = ( { noteId } ) => {
	const [ confirm, setConfirm ] = useState( false );
	const { deleteNote, setIsDeleted } = useDispatch( notesStore );
	const confirmRef = useRef();

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( confirmRef.current && ! confirmRef.current.contains( event.target ) ) {
				setConfirm( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		}
	}, [ confirmRef ] );

	return (
		<>
			{ ! confirm &&
				<Button
					className="wporg-internal-notes__note-button-delete"
					label={ __( 'Delete note', 'wporg-internal-notes' ) }
					icon="trash"
					isSecondary
					onClick={ () => { setConfirm( true ); } }
				/>
			}
			{ confirm &&
				<Button
					ref={ confirmRef }
					className="wporg-internal-notes__note-button-confirm-delete"
					isDestructive
					onClick={ () => {
						setIsDeleted( noteId );
						setTimeout( () => {
							deleteNote( noteId );
						}, 500 );
					} }
				>
					{ __( 'Delete this note?', 'wporg-internal-notes' ) }
				</Button>
			}
		</>
	);
}

export const NotesListItem = ( { className, note } ) => {
	const { id: noteId, date_gmt: dateIso, date_relative: dateRelative } = note;
	const author = note?._embedded?.author?.[0];
	const excerpt = note?.excerpt?.rendered;
	const { isCreated, isDeleted } = useSelect( ( select ) => {
		const { isCreated, isDeleted } = select( notesStore );

		return {
			isCreated: isCreated( note.id ),
			isDeleted: isDeleted( note.id ),
		};
	}, [ note ] );

	if ( ! author || ! dateRelative || ! excerpt ) {
		return(
			<li className={ classnames( 'wporg-internal-notes__note', 'is-error', className ) }>
				{ __( 'Missing data.', 'wporg-internal-notes' ) }
			</li>
		);
	}

	const avatarUrl = author.avatar_urls['24'];
	const { slug } = author;
	const classes = classnames(
		'wporg-internal-notes__note',
		{
			'is-created': isCreated,
			'is-deleted': isDeleted,
		},
		className
	);

	return (
		<li className={ classes }>
			<header className="wporg-internal-notes__note-header">
				<div>
					<div className="wporg-internal-notes__note-author">
						<img className="wporg-internal-notes__note-author-avatar" src={ avatarUrl } alt="" />
						<span className="wporg-internal-notes__note-author-name">
							<a href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }>
								{ sprintf( '@%s', slug ) }
							</a>
						</span>
					</div>
					<time className="wporg-internal-notes__note-date" title={ dateIso } dateTime={ dateIso }>
						{ dateRelative }
					</time>
				</div>
				<DeleteButton noteId={ noteId } />
			</header>
			<RawHTML className="wporg-internal-notes__note-excerpt">
				{ excerpt }
			</RawHTML>
		</li>
	);
};
