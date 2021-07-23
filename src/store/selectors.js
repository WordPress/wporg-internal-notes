
export function getNotes( state ) {
	return state.notes || [];
}

export function isCreated( state, noteId ) {
	return state.isCreated.includes( noteId );
}

export function isDeleted( state, noteId ) {
	return state.isDeleted.includes( noteId );
}
