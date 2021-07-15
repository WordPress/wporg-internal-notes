/**
 * WordPress dependencies.
 */
import { select } from '@wordpress/data';
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
