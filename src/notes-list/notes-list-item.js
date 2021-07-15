/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { RawHTML, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { store as noteStore } from '../store/';
import './notes-list-item.scss'

const DeleteButton = ( { noteId } ) => {
	const [ confirm, setConfirm ] = useState( false );
	const { deleteNote, setRemoving } = useDispatch( noteStore );
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
					className="note__button-delete"
					label={ __( 'Delete note', 'wporg-internal-notes' ) }
					icon="trash"
					isSecondary
					onClick={ () => { setConfirm( true ); } }
				/>
			}
			{ confirm &&
				<Button
					ref={ confirmRef }
					className="note__button-confirm-delete"
					isDestructive
					onClick={ ( event ) => {
						event.preventDefault();
						setRemoving( noteId );
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
				<div>
					<div className="note-author">
						<img className="note-author__avatar" src={ avatarUrl } alt="" />
						<span className="note-author__name">
							<a href={ sprintf( 'https://profiles.wordpress.org/%s', slug ) }>
								{ sprintf( '@%s', slug ) }
							</a>
						</span>
					</div>
					<time className="note-date" title={ dateIso } dateTime={ dateIso }>
						{ dateRelative }
					</time>
				</div>
				<DeleteButton noteId={ noteId } />
			</header>
			<RawHTML className="note-excerpt">
				{ excerpt }
			</RawHTML>
		</li>
	);
};
