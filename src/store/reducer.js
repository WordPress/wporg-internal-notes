/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';

const { CREATE_NOTE, FETCH_NOTES } = TYPES;

const DEFAULT_STATE = {
	postId: null,
	postType: null,
	notes: [],
};

export const reducer = (
	state = DEFAULT_STATE,
	{ note, notes, type }
) => {
	switch ( type ) {
		case CREATE_NOTE:
			return {
				...state,
				notes: [ note, ...state.notes ],
			}
		case FETCH_NOTES:
			return {
				...state,
				notes
			}
		default:
			return state;
	}
}
