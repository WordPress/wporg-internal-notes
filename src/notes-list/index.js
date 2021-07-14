/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { store as notesStore } from "../store/";
import { NotesListItem } from "./notes-list-item";
import './index.scss'

export const NotesList = () => {
	const { notes, hasNewNote } = useSelect( ( select ) => {
		const notesQueryArgs = {
			_embed: true,
			context: 'edit',
			per_page: 100,
		};
		const { getNotes, hasNewNote } = select( notesStore );

		return {
			notes: getNotes( notesQueryArgs ),
			hasNewNote: hasNewNote(),
		};
	} );

	return (
		<ul className="notes-list">
			{ notes.map( ( note, index ) =>
				<NotesListItem
					key={ note.id }
					className={ ( 0 === index && hasNewNote ) ? 'note-new' : '' }
					note={ note }
				/>
			) }
		</ul>
	);
};
