/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import TYPES from './action-types';
import { getApiPath } from "./utils";

const { CREATE_NOTE, FETCH_NOTES } = TYPES;

export function* createNote( noteData ) {
	const result = yield apiFetch( {
		path: getApiPath(),
		method: 'POST',
		data: noteData,
	} );

	if ( result ) {
		return {
			type: CREATE_NOTE,
			note: result,
		}
	}
}

export const fetchNotes = notes => {
	return {
		type: FETCH_NOTES,
		notes
	};
};
