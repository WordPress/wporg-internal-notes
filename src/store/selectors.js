
export function getNotes( state ) {
	return state.notes || [];
}

export function hasNewNote( state ) {
	return state.hasNewNote;
}

export function isRemovingNote( state ) {
	return state.removingNote;
}
