/**
 * Internal dependencies.
 */
import { NotesListItem } from "./notes-list-item";
import './index.scss'

export const NotesList = ( { notes } ) => {
	return (
		<ul className="wporg-internal-notes__notes-list">
			{ notes.map( ( note ) =>
				<NotesListItem
					key={ note.id }
					note={ note }
				/>
			) }
		</ul>
	);
};
