import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { StorageAdapterInterface } from 'ember-iniesta/storage-adapters/storage-adapter';
import { CollectorInterface } from 'ember-iniesta/services/collector';
import { DispatcherInterface } from 'ember-iniesta/services/dispatcher';
import Service from '@ember/service';
import { TestContext } from 'ember-test-helpers';
import waitUntil from '@ember/test-helpers/wait-until';

module('Unit | Service | dispatcher', (hooks) => {
	let sandbox: sinon.SinonSandbox;
	let collector: CollectorInterface;
	let subject: (new (...args: any[]) => DispatcherInterface);

	class DummyCollectorService extends Service implements CollectorInterface {
		public storageAdapter!: StorageAdapterInterface
		private content: any[] = [];
		async count() {
			return this.content.length;
		}
		async push() {
			this.content.push(...arguments);

			return true;
		}
		async pop(count: number = 1) {
			return this.content.splice(-count);
		}
		async unshift() {
			this.content.unshift(...arguments);

			return true;
		}
		async shift(count: number = 1) {
			return this.content.splice(count);
		}
	}

	setupTest(hooks);

	hooks.beforeEach(async function(this: TestContext) {
		sandbox = sinon.createSandbox({ useFakeTimers: true });
		collector = new DummyCollectorService();
		subject = this.owner.factoryFor('service:dispatcher');
	});

	test('it exists', (assert) => {
		const service = new subject({ dispatcherPath: 'examples/dummy.js' });

		assert.ok(service);
	});

	test('it is not running by default', (assert) => {
		const service = new subject({ dispatcherPath: 'examples/dummy.js' });

		assert.notOk(service.get('isRunning'), 'service is not running');
	});

	test('it starts dispatcher', async(assert) => {
		const service = new subject({ dispatcherPath: 'examples/dummy.js' });

		await service.start();

		assert.ok(service.get('isRunning'), 'service is running');
	});

	test('it stops dispatcher', async(assert) => {
		const service = new subject({ dispatcherPath: 'examples/dummy.js' });

		await service.start();

		await service.stop();

		assert.notOk(service.get('isRunning'), 'service is not running');
	});

	test('it dispatches on timeout', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/timeout.js',
			maxTimeout: 30000
		});

		await service.start();

		assert.notOk(service.get('isDispatching'), 'service is not dispatching');

		sandbox.clock.tick(15000);

		assert.notOk(service.get('isDispatching'), 'service is not dispatching');

		sandbox.clock.tick(15000);

		assert.ok(service.get('isDispatching'), 'service is dispatching');
	});

	test('it does not dispatches when is stopped', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/timeout.js',
			maxTimeout: 30000
		});

		await service.start();
		await service.stop();

		sandbox.clock.tick(30000);

		assert.notOk(service.get('isDispatching'), 'service is not dispatching');
	});

	test('it asserts when dispatcher path is empty', (assert) => {
		assert.throws(() => {
			// eslint-disable-next-line no-new
			new subject();
		});
	});

	test('it calls dispatcher with collector items and stores received items on collector', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/reverse.js',
			maxTimeout: 30000
		});

		await collector.push(1, 2, 3);

		await service.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !service.get('isDispatching'));

		assert.equal(await collector.shift(3), [3, 2, 1], 'dispatcher has returned items to collector');
	});

	test('it calls dispatcher with max items', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/reverse.js',
			maxTimeout: 30000,
			maxConcurrent: 5
		});

		await collector.push(1, 2, 3, 4, 5, 6);

		await service.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !service.get('isDispatching'));

		assert.equal(await collector.shift(6), [5, 4, 3, 2, 1, 6], 'dispatcher has returned items to collector');
	});

	test('it does not insert items on collector', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/empty.js',
			maxTimeout: 30000
		});

		await collector.push(1, 2, 3);

		await service.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !service.get('isDispatching'));

		assert.equal(await collector.count(), 0, 'dispatcher has returned items to collector');
	});

	test('it sends config to dispatcher', async(assert) => {
		const service = new subject({
			dispatcherPath: 'examples/params.js',
			maxTimeout: 30000
		});
		const options = {
			foo: 'bar'
		};

		await service.start();

		service.setOptions(options);

		await collector.push(1);

		sandbox.clock.tick(30000);

		await waitUntil(() => !service.get('isDispatching'));

		assert.deepEqual(await collector.shift(), [[1], options], 'dispatcher has returned items to collector');
	});
});

