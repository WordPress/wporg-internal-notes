/**
 * WordPress dependencies.
 */
import { select } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';

export const getApiPath = ( queryArgs = [] ) => {
	const postId = select( 'core/editor' ).getCurrentPostId();
	const postType = select( 'core/editor' ).getCurrentPostType();
	const { rest_base: restBase } = select( 'core' ).getPostType( postType );

	return addQueryArgs( `/wp/v2/${ restBase }/${ postId }/internal-notes`, queryArgs );
};
