/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const { CLEAR_NEW, CREATE_NOTE, FETCH_NOTES } = TYPES;

const DEFAULT_STATE = {
	notes: [],
	hasNewNote: false,
};

export const reducer = (
	state = DEFAULT_STATE,
	{ note, notes, type }
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
		case FETCH_NOTES:
			return {
				...state,
				notes,
			};
		default:
			return state;
	}
}
