/**
 * WordPress dependencies.
 */
import { createReduxStore, register } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';

/**
 * Internal dependencies.
 */
import * as actions from './actions';
import reducer from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

/**
 * Module Constants.
 */
const STORE_NAME = 'wporg/internal-notes';

/**
 * Store definition.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
 *
 * @type {Object}
 */
export const store = createReduxStore( STORE_NAME, {
	reducer,
	selectors,
	actions,
	controls,
	resolvers,
} );

register( store );
