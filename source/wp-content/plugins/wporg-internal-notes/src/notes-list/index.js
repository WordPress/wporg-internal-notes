/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { NotesListItem } from './notes-list-item';
import { store as notesStore } from '../store';
import './index.scss';

export const NotesList = ( { notes } ) => {
	const currentFilter = useSelect( ( select ) => {
		return select( notesStore ).getFilter();
	} );

	const classes = classnames(
		'wporg-internal-notes__notes-list',
		'filter-' + currentFilter,
	);

	return (
		<ul className={ classes }>
			{ notes.map( ( note ) => (
				<NotesListItem key={ note.id } note={ note } />
			) ) }
		</ul>
	);
};
