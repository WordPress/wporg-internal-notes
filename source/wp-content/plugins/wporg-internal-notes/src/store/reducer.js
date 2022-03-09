/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const {
	CREATE_NOTE,
	DELETE_NOTE,
	SET_NOTES,
	PREPEND_NOTES,
	APPEND_NOTES,
	CLEAR_IS_CREATED,
	SET_IS_DELETED,
	SET_FILTER,
} = TYPES;

const DEFAULT_STATE = {
	totalNotes: 0,
	notes: [],
	isCreated: [],
	isDeleted: [],
	filter: 'all',
};

export const reducer = ( state = DEFAULT_STATE, { note, notes, noteId, totalNotes, type, filter } ) => {
	switch ( type ) {
		case CREATE_NOTE:
			return {
				...state,
				totalNotes: state.totalNotes + 1,
				notes: [ note, ...state.notes ],
				isCreated: [ ...state.isCreated, note.id ],
			};
		case CLEAR_IS_CREATED:
			return {
				...state,
				isCreated: [ ...state.isCreated ].filter( ( id ) => id !== noteId ),
			};
		case DELETE_NOTE:
			return {
				...state,
				totalNotes: state.totalNotes - 1,
				notes: [ ...state.notes ].filter( ( item ) => item.id !== noteId ),
				isDeleted: [ ...state.isDeleted ].filter( ( id ) => id !== noteId ),
			};
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
		case PREPEND_NOTES:
			const prependedNoteIds = notes.map( ( prependedNote ) => prependedNote.id );

			return {
				...state,
				totalNotes: state.totalNotes + totalNotes,
				notes: [ ...notes, ...state.notes ],
				isCreated: [ ...state.isCreated, ...prependedNoteIds ],
			};
		case APPEND_NOTES:
			const appendedNoteIds = notes.map( ( appendedNote ) => appendedNote.id );

			return {
				...state,
				notes: [ ...state.notes, ...notes ],
				isCreated: [ ...state.isCreated, ...appendedNoteIds ],
			};
		case SET_FILTER:
			return {
				...state,
				filter,
			};
		default:
			return state;
	}
};
