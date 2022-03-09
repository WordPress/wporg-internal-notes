/**
 * WordPress dependencies.
 */
import { select } from '@wordpress/data';
import { __unstableAwaitPromise, apiFetch } from '@wordpress/data-controls'; // eslint-disable-line @wordpress/no-unsafe-wp-apis
import { addQueryArgs } from '@wordpress/url';

export const getApiPath = ( { noteId, queryArgs = [] } ) => {
	const postId = select( 'core/editor' ).getCurrentPostId();
	const postType = select( 'core/editor' ).getCurrentPostType();
	const { rest_base: restBase } = select( 'core' ).getPostType( postType );

	let path = `/wp/v2/${ restBase }/${ postId }/internal-notes`;
	if ( noteId ) {
		path += `/${ noteId }`;
	}

	return addQueryArgs( path, queryArgs );
};

export function* fetchNotes( { after = null, offset = 0 } ) {
	const queryArgs = {
		_embed: true,
		context: 'edit',
		per_page: 20,
		offset: offset,
	};

	if ( after ) {
		queryArgs.after = after;
	}

	const response = yield apiFetch( {
		path: getApiPath( { queryArgs } ),
		parse: false,
	} );

	const parseResponse = async ( resp ) => {
		return {
			totalNotes: Number( resp.headers?.get( 'X-WP-Total' ) || 0 ),
			notes: await resp.json(),
		};
	};

	const result = yield __unstableAwaitPromise( parseResponse( response ) );

	if ( result ) {
		return result;
	}
}
