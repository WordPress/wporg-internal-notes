/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { fetchNotes } from "./actions";
import { getApiPath } from "./utils";

export function* getNotes( queryArgs ) {
	const path = getApiPath( { queryArgs } );

	const results = yield apiFetch( { path } );

	if ( results ) {
		return fetchNotes( results );
	}
}
