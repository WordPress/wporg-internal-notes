/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const { CLEAR_NEW, CREATE_NOTE, DELETE_NOTE, FETCH_NOTES, SET_REMOVING } = TYPES;

const DEFAULT_STATE = {
	notes: [],
	hasNewNote: false,
};

export const reducer = (
	state = DEFAULT_STATE,
	{ note, notes, noteId, type }
) => {
	switch ( type ) {
		case CLEAR_NEW:
			return {
				...state,
				hasNewNote: false,
			};
		case CREATE_NOTE:
			return {
				...state,
				notes: [ note, ...state.notes ],
				hasNewNote: true,
			};
		case DELETE_NOTE:
			return {
				...state,
				notes: [ ...state.notes ].filter( item => item.id !== noteId ),
				removingNote: false,
			}
		case FETCH_NOTES:
			return {
				...state,
				notes,
			};
		case SET_REMOVING:
			return {
				...state,
				removingNote: noteId,
			}
		default:
			return state;
	}
}
