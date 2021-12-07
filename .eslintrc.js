module.exports = {
	env: {
		es6: true,
		node: true,
	},

	extends: [
		'eslint:recommended',
		'plugin:import/recommended',
		'plugin:mocha/recommended',
		'plugin:node/recommended',
		'plugin:prettier/recommended',
		'prettier',
	],

	parserOptions: {
		ecmaVersion: 2015,
	},

	plugins: ['import', 'mocha', 'node', 'prettier'],

	//noInlineConfig: true,

	reportUnusedDisableDirectives: true,

	root: true,

	rules: {
		'import/unambiguous': 'off',
	},
}
