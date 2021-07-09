/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';
import { getApiPath } from "./utils";

const { CREATE_NOTE, FETCH_NOTES } = TYPES;

export function* createNote( noteData ) {
	const queryArgs = {
		_embed: true,
		context: 'edit',
	};

	const result = yield apiFetch( {
		path: addQueryArgs( getApiPath(), queryArgs ),
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
