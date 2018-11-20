import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { setProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { assert } from '@ember/debug';
import { LIMITS } from '../constants';

export default Service.extend({

	/**
	 * WebWorker service injection.
	 *
	 * @property worker
	 * @type {Service}
	 */
	worker: service(),

	/**
	 * Configuration property. Values:
	 *
	 *  * MAX_SECONDS_TIMEOUTS
	 *  * MAX_ITEMS_CONCURRENTS
	 *
	 * @property _config
	 * @type {Object}
	 */
	_limits: reads(LIMITS).readOnly(),

	/**
	 * Init window listeners.
	 *
	 * @method init
	 */
	init() {
		this._super(...arguments);

		this.stopRunningAndDispatching();
		this.setConfiguration();
	},

	/**
	 * Method to start dispatcher information
	 *
	 * @method start
	 * @param {Object} config
	 * @return {Promise}
	 */
	async start() {
		const { maxTimeout } = this.get('_config');

		this.set('_isRunning', true);

		setTimeout(() => {
			return resolve();
		}, maxTimeout);
	},

	/**
	 * Method to stop dispatcher information
	 *
	 * @method stop
	 * @return {Promise}
	 */
	async stop() {
		this.stopRunningAndDispatching();

		return resolve();
	},

	/**
	 * Method to dispatch information
	 *
	 * @method dispatch
	 * @param {Object} items
	 * @return {Promise}
	 */
	async dispatch(items) {
		assert('Items are necessary and they must be length', items && items.length);
	},

	/**
	 * Method to set running and dispathing properties to false value
	 *
	 * @method stopRunningAndDispatching
	 */
	stopRunningAndDispatching() {
		setProperties(this, {
			_isRunning: false,
			_isDispatching: false
		});
	},

	/**
	 * Method to set configuration
	 *
	 * @method setConfiguration
	 */
	setConfiguration() {
		const config = this.get('config');

		assert('You must define `dispatcherPath` property on your configuration', get(config, 'dispatcherPath'));

		setProperties(config, {
			maxTimeout: get(config, 'maxTimeout') || LIMITS.MAX_TIMEOUTS,
			maxConcurrent: get(config, 'maxConcurrent') || LIMITS.MAX_CONCURRENTS
		});

		this.set('_config', config);
	}
});
