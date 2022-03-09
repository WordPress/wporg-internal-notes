export function getNotes( state ) {
	return state.notes || [];
}

export function getCurrentNotesCount( state ) {
	return state.notes.length;
}

export function getTotalNotesCount( state ) {
	return state.totalNotes;
}

export function isCreated( state, noteId ) {
	return state.isCreated.includes( noteId );
}

export function isDeleted( state, noteId ) {
	return state.isDeleted.includes( noteId );
}

export function getLatestNoteDate( state ) {
	return state.notes.at(0)?.date || '';
}

export function getFilter( state ) {
	return state.filter;
}

export function getNoteTypes( state ) {
	const types = state.notes.map( note => note.type );

	return [ ...new Set( types ) ];
}
