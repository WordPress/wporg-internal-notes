/**
 * Internal dependencies.
 */
import { setNotes } from './actions';

export function* getNotes() {
	yield setNotes();
}
