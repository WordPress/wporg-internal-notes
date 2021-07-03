/**
 * WordPress dependencies.
 */
import { PanelRow } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import NoteListItem from "./note-list-item";
import { store as notesStore } from "./store";

const NotesList = () => {
	const notesQueryArgs = {
		_embed: true,
		context: 'edit',
		per_page: 100,
	};
	const notes = useSelect( ( select ) => select( notesStore ).getNotes( notesQueryArgs ) );

	return (
		<>
			{ notes.map(
				( note, index ) => <NoteListItem key={ `${ index }-${ note.timestamp.raw }` } note={ note } />
			) }
		</>
	);
};

export default NotesList;
