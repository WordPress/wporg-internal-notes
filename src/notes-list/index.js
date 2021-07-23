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
	const notes = useSelect( ( select ) => {
		const { getNotes } = select( notesStore );
		const notesQueryArgs = {
			_embed: true,
			context: 'edit',
			per_page: 100,
		};

		return getNotes( notesQueryArgs );
	} );

	return (
		<ul className="notes-list">
			{ notes.map( ( note ) =>
				<NotesListItem
					key={ note.id }
					note={ note }
				/>
			) }
		</ul>
	);
};
