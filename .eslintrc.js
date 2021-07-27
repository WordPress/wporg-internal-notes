/**
 * Internal dependencies
 */
const prettierConfig = require( './.prettierrc' );

module.exports = {
	extends: 'plugin:@wordpress/eslint-plugin/recommended',

	root: true,

	globals: {
		wp: true, // eslint-disable-line id-length
	},

	ignorePatterns: [ '*.min.js' ],

	rules: {
		/**
		 * All @wordpress packages get resolved separately.
		 */
		'import/no-unresolved': [ 1, { ignore: [ '^@wordpress/' ] } ],
		'import/no-extraneous-dependencies': [ 'off' ],

		/*
		 * Set up our text domain.
		 */
		'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: [ 'wporg-internal-notes' ] } ],

		/*
		 * Short variable names are almost always obscure and non-descriptive, but they should be meaningful,
		 * obvious, and self-documenting.
		 */
		'id-length': [
			'error',
			{
				min: 3,
				exceptions: [ '__', '_n', '_x', 'id', 'a', 'b', 'i' ],
			},
		],

		/*
		 * Force a line-length of 115 characters.
		 *
		 * We ignore URLs, trailing comments, strings, and template literals to prevent awkward fragmenting of
		 * meaningful content.
		 */
		'max-len': [
			'error',
			{
				code: 115,
				ignoreUrls: true,
				ignoreTrailingComments: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
			},
		],

		/*
		 * Sort imports alphabetically, at least inside multiple-member imports. Ignores declaration sorting since
		 * this interferes with the External/WordPress/Internal groupings. For example, it will flag the following
		 * as incorrect:
		 *
		 *   import { c, a, b } from 'foo';
		 *
		 * Running `eslint --fix` will update this to
		 *
		 *   import { a, b, c } from 'foo';
		 *
		 */
		'sort-imports': [
			'error',
			{
				ignoreDeclarationSort: true,
			},
		],

		/*
		 * Import our local prettier config to be used by the prettier rule.
		 *
		 * `wp-scripts lint-js` does this automatically, but local eslint (ex, in code editors) does not know the
		 * connection, and will default back to vanilla prettier configuration.
		 */
		'prettier/prettier': [ 'error', prettierConfig ],
	},
};
