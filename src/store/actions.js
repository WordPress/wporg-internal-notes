/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';
import { getApiPath } from "./utils";

const { CREATE_NOTE, DELETE_NOTE, FETCH_NOTES, CLEAR_IS_CREATED, SET_IS_DELETED } = TYPES;

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

export const clearIsCreated = ( noteId ) => {
	return {
		type: CLEAR_IS_CREATED,
		noteId
	};
};

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

export const setIsDeleted = ( noteId ) => {
	return {
		type: SET_IS_DELETED,
		noteId
	};
};

export const fetchNotes = notes => {
	return {
		type: FETCH_NOTES,
		notes
	};
};
