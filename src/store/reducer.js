/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const { CREATE_NOTE, DELETE_NOTE, SET_NOTES, APPEND_NOTES, CLEAR_IS_CREATED, SET_IS_DELETED } = TYPES;

const DEFAULT_STATE = {
	totalNotes: 0,
	notes: [],
	isCreated: [],
	isDeleted: [],
};

export const reducer = (
	state = DEFAULT_STATE,
	{ note, notes, noteId, totalNotes, type }
) => {
	switch ( type ) {
		case CREATE_NOTE:
			return {
				...state,
				totalNotes: state.totalNotes ++,
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
				totalNotes: state.totalNotes --,
				notes: [ ...state.notes ].filter( item => item.id !== noteId ),
				isDeleted: [ ...state.isDeleted ].filter( id => id !== noteId ),
			}
		case SET_IS_DELETED:
			return {
				...state,
				isDeleted: [ ...state.isDeleted, noteId ],
			};
		case SET_NOTES:
			return {
				...state,
				totalNotes,
				notes,
			};
		case APPEND_NOTES:
			const noteIds = notes.map( note => note.id );

			return {
				...state,
				totalNotes,
				notes: [ ...state.notes, ...notes ],
				isCreated: [ ...state.isCreated, ...noteIds ],
			};
		default:
			return state;
	}
}
