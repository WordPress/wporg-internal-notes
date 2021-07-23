/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const { CREATE_NOTE, DELETE_NOTE, FETCH_NOTES, CLEAR_IS_CREATED, SET_IS_DELETED } = TYPES;

const DEFAULT_STATE = {
	notes: [],
	isCreated: [],
	isDeleted: [],
};

export const reducer = (
	state = DEFAULT_STATE,
	{ note, notes, noteId, type }
) => {
	switch ( type ) {
		case CREATE_NOTE:
			return {
				...state,
				notes: [ note, ...state.notes ],
				isCreated: [ ...state.isCreated, note.id ],
			};
		case CLEAR_IS_CREATED:
			return {
				...state,
				isCreated: [ ...state.isCreated ].filter( id => id !== noteId ),
			};
		case DELETE_NOTE:
			return {
				...state,
				notes: [ ...state.notes ].filter( item => item.id !== noteId ),
				isDeleted: [ ...state.isDeleted ].filter( id => id !== noteId ),
			}
		case SET_IS_DELETED:
			return {
				...state,
				isDeleted: [ ...state.isDeleted, noteId ],
			};
		case FETCH_NOTES:
			return {
				...state,
				notes,
			};
		default:
			return state;
	}
}
