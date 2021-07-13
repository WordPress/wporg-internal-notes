/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { fetchNotes } from "./actions";
import { getApiPath } from "./utils";

export function* getNotes( args ) {
	const path = getApiPath( args );

	const results = yield apiFetch( { path } );

	if ( results ) {
		return fetchNotes( results );
	}
}
