/**
 * External dependencies.
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies.
 */
import { NotesSidebar } from './sidebar';

const PluginWrapper = () => {
	return (
		<>
			<NotesSidebar />
		</>
	);
};

registerPlugin( 'wporg-internal-notes', {
	render: PluginWrapper,
} );
