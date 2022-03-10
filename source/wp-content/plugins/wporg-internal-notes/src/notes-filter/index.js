/**
 * WordPress dependencies.
 */
import { DropdownMenu } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as notesStore } from '../store';

export const NotesFilter = () => {
	const { currentFilter, hasMultipleTypes } = useSelect( ( select ) => {
		const { getFilter, getNoteTypes } = select( notesStore );

		return {
			currentFilter: getFilter(),
			hasMultipleTypes: getNoteTypes().length > 1,
		};
	} );
	const { setFilter } = useDispatch( notesStore );

	const controlLabels = {
		all: __( 'All Notes', 'wporg' ),
		'wporg-internal-note': __( 'Internal Notes', 'wporg' ),
		'wporg-log-note': __( 'Log Notes', 'wporg' ),
	};

	const [ dropDownLabel, setDropDownLabel ] = useState( controlLabels[ currentFilter ] );

	const controls = [
		{
			title: controlLabels.all,
			disabled: 'all' === currentFilter,
			onClick: () => {
				setFilter( 'all' );
				setDropDownLabel( controlLabels.all );
			},
		},
		{
			title: controlLabels[ 'wporg-internal-note' ],
			disabled: 'wporg-internal-note' === currentFilter,
			onClick: () => {
				setFilter( 'wporg-internal-note' );
				setDropDownLabel( controlLabels[ 'wporg-internal-note' ] );
			},
		},
		{
			title: controlLabels[ 'wporg-log-note' ],
			disabled: 'wporg-log-note' === currentFilter,
			onClick: () => {
				setFilter( 'wporg-log-note' );
				setDropDownLabel( controlLabels[ 'wporg-log-note' ] );
			},
		},
	];

	return (
		<>
			{ hasMultipleTypes && (
				<DropdownMenu
					className="wporg-internal-notes__filter"
					icon="filter"
					label={ __( 'Filter notes', 'wporg' ) }
					text={ dropDownLabel }
					controls={ controls }
				/>
			) }
		</>
	);
};
