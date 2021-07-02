/**
 * WordPress dependencies.
 */
import { select } from '@wordpress/data';

export const getApiPath = () => {
	const postId = select( 'core/editor' ).getCurrentPostId();
	const postType = select( 'core/editor' ).getCurrentPostType();
	const { rest_base: restBase } = select( 'core' ).getPostType( postType );

	return `/wp/v2/${ restBase }/${ postId }/internal-notes`;
};
