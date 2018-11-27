/* eslint-env node */
'use strict';

module.exports = {
	root: true,
	parser: 'typescript-eslint-parser',
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module'
	},
	plugins: [
		'ember',
		'typescript'
	],
	extends: 'eslint-config-bbva',
	env: {
		browser: true
	},
	overrides: [{
		files: ['**/*.ts'],
		rules: {
			'no-unused-vars': 0
		}
	}, {
		files: [
			'.eslintrc.js',
			'.template-lintrc.js',
			'ember-cli-build.js',
			'index.js',
			'testem.js',
			'blueprints/*/index.js',
			'config/**/*.js',
			'tests/dummy/config/**/*.js'
		],
		excludedFiles: [
			'addon/**',
			'addon-test-support/**',
			'app/**',
			'tests/dummy/app/**'
		],
		parserOptions: {
			sourceType: 'script',
			ecmaVersion: 2015
		},
		env: {
			browser: false,
			node: true
		},
		plugins: ['node']
	}]
};
