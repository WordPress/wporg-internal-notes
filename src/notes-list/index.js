/**
 * WordPress dependencies.
 */
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { store as notesStore } from "../store/";
import { NotesListItem } from "./notes-list-item";
import './index.scss'

export const NotesList = () => {
	const notesQueryArgs = {
		_embed: true,
		context: 'edit',
		per_page: 100,
	};
	const notes = useSelect( ( select ) => select( notesStore ).getNotes( notesQueryArgs ) );

	return (
		<PanelBody>
			<ul className="notes-list">
				{ notes.map(
					( note, index ) => <NotesListItem key={ `${ index }-${ note.timestamp.raw }` } note={ note } />
				) }
			</ul>
		</PanelBody>
	);
};
