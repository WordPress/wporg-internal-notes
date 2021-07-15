/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';
import { getApiPath } from "./utils";

const { CLEAR_NEW, CREATE_NOTE, DELETE_NOTE, FETCH_NOTES, SET_REMOVING } = TYPES;

export const clearNew = () => {
	return { type: CLEAR_NEW };
};

export function* createNote( noteData ) {
	const queryArgs = {
		_embed: true,
		context: 'edit',
	};

	const result = yield apiFetch( {
		path: getApiPath( { queryArgs } ),
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

export function* deleteNote( noteId ) {
	const result = yield apiFetch( {
		path: getApiPath( { noteId } ),
		method: 'DELETE',
	} );

	if ( result ) {
		return {
			type: DELETE_NOTE,
			noteId: noteId,
		}
	}
}

export const fetchNotes = notes => {
	return {
		type: FETCH_NOTES,
		notes
	};
};

export const setRemoving = ( noteId ) => {
	return {
		type: SET_REMOVING,
		noteId: noteId,
	};
};
