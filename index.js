/* eslint-env node */
/* eslint-disable consistent-this */
'use strict';

const fastbootTransform = require('fastboot-transform');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');
const concat = require('broccoli-concat');

function processBabel(tree, options) {
	const Babel = require('broccoli-babel-transpiler');

	return new Babel(tree, options);
}

module.exports = {
	name: 'ember-collector-dispatcher',

	included(app) {
		this._super.included(app);
		this._ensureThisImport();

		this.import('vendor/dexie/dexie.js');
		this.import('vendor/shims/dexie.js');
	},

	treeForVendor(vendorTree) {
		const dexiePath = this._getPath();
		const trees = [];

		if (vendorTree) {
			trees.push(vendorTree);
		}

		const dexieTree = fastbootTransform(new Funnel(dexiePath, {
			include: ['dexie.js'],
			destDir: 'dexie'
		}));

		trees.push(dexieTree);

		return new MergeTrees(trees, { overwrite: true });
	},

	_getPath() {
		return path.dirname(require.resolve('dexie'));
	},

	_ensureThisImport() {
		if (!this.import) {
			this._findHost = function findHostShim() {
				let current = this;
				let app;

				do {
					app = current.app || app;
				} while (current.parent.parent && (current = current.parent));

				return app;
			};

			this.import = function importShim(asset, options) {
				const app = this._findHost();

				app.import(asset, options);
			};
		}
	}
};
