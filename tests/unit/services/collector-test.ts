import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { StorageAdapterInterface } from 'ember-iniesta/storage-adapters/storage-adapter';
import EmberObject from '@ember/object';
import { TestContext } from 'ember-test-helpers';
import { CollectorInterface } from 'ember-iniesta/services/collector';

interface EmberFactory<T> {
	create(...args: any[]): T
}

module('Unit | Service | collector', (hooks) => {
	let Factory: EmberFactory<CollectorInterface>;

	setupTest(hooks);

	class DummyStorageAdapter extends EmberObject implements StorageAdapterInterface {
		private supported!: boolean;
		async isSupported() {
			return this.supported;
		}
		async count() {
			return this.supported ? 1 : 0;
		}
		async push() {}
		async unshift() {}
		async pop() {
			return [];
		}
		async shift() {
			return [];
		}
	}

	hooks.beforeEach(function(this: TestContext) {
		this.owner.register('storage-adapter:dummy', DummyStorageAdapter);

		Factory = this.owner.factoryFor('service:collector');
	});

	test('it exists', (assert) => {
		const service = Factory.create();

		assert.ok(service);
	});

	test('it throws an error when adapters is not defined', async(assert) => {
		const service = Factory.create({ adapters: null });

		try {
			await service.setup();

			assert.ok(false, 'unexpected branch');
		} catch (e) {
			assert.ok(e instanceof Error, 'error expected');
		}
	});

	test('it throws an error when has no adapters', async(assert) => {
		const service = Factory.create({ adapters: [] });

		try {
			await service.setup();

			assert.ok(false, 'unexpected branch');
		} catch (e) {
			assert.ok(e instanceof Error, 'error expected');
		}
	});

	test('it setups first supported adapter', async(assert) => {
		const adapters = [
			['dummy', { supported: false }],
			'dummy'
		];
		const service = Factory.create({ adapters });

		await service.setup();

		assert.equal(service.count(), 1);
	});
});

