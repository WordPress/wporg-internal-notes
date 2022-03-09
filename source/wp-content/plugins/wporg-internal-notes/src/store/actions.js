/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { TYPES } from './action-types';
import { fetchNotes, getApiPath } from './utils';

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
		};
	}
}

export const clearIsCreated = ( noteId ) => {
	return {
		type: CLEAR_IS_CREATED,
		noteId: noteId,
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
		};
	}
}

export const setIsDeleted = ( noteId ) => {
	return {
		type: SET_IS_DELETED,
		noteId: noteId,
	};
};

export function* setNotes() {
	const { totalNotes, notes } = yield fetchNotes( {} );

	return {
		type: SET_NOTES,
		totalNotes: totalNotes,
		notes: notes,
	};
}

export function* prependNotes( after ) {
	const { totalNotes, notes } = yield fetchNotes( { after } );

	return {
		type: PREPEND_NOTES,
		totalNotes: totalNotes,
		notes: notes,
	};
}

export function* appendNotes( offset ) {
	const { totalNotes, notes } = yield fetchNotes( { offset } );

	return {
		type: APPEND_NOTES,
		totalNotes: totalNotes,
		notes: notes,
	};
}

export const setFilter = ( filter ) => {
	return {
		type: SET_FILTER,
		filter: filter,
	};
};
