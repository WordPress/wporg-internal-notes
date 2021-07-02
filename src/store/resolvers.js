/**
 * WordPress dependencies.
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import { fetchNotes } from "./actions";
import { getApiPath } from "./utils";

export function* getNotes() {
	const results = yield apiFetch( {
		path: getApiPath(),
	} );

	if ( results ) {
		return fetchNotes( results );
	}
}
