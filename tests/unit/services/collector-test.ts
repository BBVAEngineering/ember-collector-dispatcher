import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { StorageAdapterInterface } from 'ember-iniesta/storage-adapters/storage-adapter';
import EmberObject from '@ember/object';
import { TestContext } from 'ember-test-helpers';
import { CollectorInterface } from 'ember-iniesta/services/collector';
import sinon from 'sinon';

interface EmberFactory<T> {
	create(...args: any[]): T
}

module('Unit | Service | collector', (hooks) => {
	let Factory: EmberFactory<CollectorInterface>;
	const sandbox = sinon.createSandbox();
	const isSupported = sandbox.stub();
	const count = sandbox.stub();
	const push = sandbox.stub();
	const unshift = sandbox.stub();
	const pop = sandbox.stub();
	const shift = sandbox.stub();

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

	class StubStorageAdapter extends EmberObject implements StorageAdapterInterface {
		isSupported = isSupported;
		count = count;
		push = push;
		unshift = unshift;
		pop = pop;
		shift = shift;
	}


	hooks.beforeEach(function(this: TestContext) {
		this.owner.register('storage-adapter:dummy', DummyStorageAdapter);
		this.owner.register('storage-adapter:stub', StubStorageAdapter);

		Factory = this.owner.factoryFor('service:collector');
	});

	hooks.afterEach(() => {
		sandbox.reset();
	});

	test('it exists', (assert) => {
		const service = Factory.create();

		assert.ok(service);
	});

	test('it throws an error when adapters is not defined', async(assert) => {
		const service = Factory.create({ adapters: null });

		try {
			await service.count();

			assert.ok(false, 'unexpected branch');
		} catch (e) {
			assert.ok(e instanceof Error, 'error expected');
		}
	});

	test('it throws an error when has no adapters', async(assert) => {
		const service = Factory.create({ adapters: [] });

		try {
			await service.count();

			assert.ok(false, 'unexpected branch');
		} catch (e) {
			assert.ok(e instanceof Error, 'error expected');
		}
	});

	test('it setups first supported adapter', async(assert) => {
		const adapters = [
			['dummy', { supported: false }],
			['dummy', { supported: true }]
		];
		const service = Factory.create({ adapters });

		await service.count();

		assert.equal(await service.count(), 1);
	});

	test('it throws an error when there is no supported adapter', async(assert) => {
		const adapters = [
			['dummy', { supported: false }],
			['dummy', { supported: false }]
		];
		const service = Factory.create({ adapters });

		try {
			await service.count();

			assert.ok(false, 'unexpected branch');
		} catch (e) {
			assert.ok(e instanceof Error, 'error expected');
		}
	});

	test('it calls count method on adapter', async(assert) => {
		isSupported.resolves(true);
		count.resolves(0);

		const service = Factory.create({ adapters: ['stub'] });

		await service.count();

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
		assert.ok(count.calledOnce, 'adapter method count is called');
	});

	test('it calls push method on adapter', async(assert) => {
		isSupported.resolves(true);
		push.resolves();

		const service = Factory.create({ adapters: ['stub'] });

		await service.push(1);

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
		assert.ok(push.calledOnceWith(1), 'adapter method push is called');
	});

	test('it calls unshift method on adapter', async(assert) => {
		isSupported.resolves(true);
		unshift.resolves();

		const service = Factory.create({ adapters: ['stub'] });

		await service.unshift(1);

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
		assert.ok(unshift.calledOnceWith(1), 'adapter method unshift is called');
	});

	test('it calls pop method on adapter', async(assert) => {
		isSupported.resolves(true);
		pop.resolves([1, 2]);

		const service = Factory.create({ adapters: ['stub'] });

		await service.pop(2);

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
		assert.ok(pop.calledOnceWith(2), 'adapter method pop is called');
	});

	test('it calls shift method on adapter', async(assert) => {
		isSupported.resolves(true);
		shift.resolves([1, 2]);

		const service = Factory.create({ adapters: ['stub'] });

		await service.shift(2);

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
		assert.ok(shift.calledOnceWith(2), 'adapter method shift is called');
	});

	test('it checks for support only once', async(assert) => {
		isSupported.resolves(true);
		count.resolves(0);

		const service = Factory.create({ adapters: ['stub'] });

		await service.count();

		assert.ok(isSupported.calledOnce, 'adapter method isSupported is called');
	});
});

