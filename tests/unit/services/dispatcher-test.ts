import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon, { SinonStub, SinonSpy } from 'sinon';
import { CollectorInterface } from 'ember-collector-dispatcher/services/collector';
import Dispatcher, { DispatcherInterface } from 'ember-collector-dispatcher/services/dispatcher';
import Service from '@ember/service';
import { TestContext } from 'ember-test-helpers';
import { MAX_TIMEOUT, MAX_CONCURRENT } from 'ember-collector-dispatcher/constants';
import { inject } from '@ember-decorators/service';
import waitUntil from '@ember/test-helpers/wait-until';

declare module '@ember/service' {
	interface Registry {
		'dummy-collector': CollectorInterface;
	}
}

module('Unit | Service | dispatcher', (hooks) => {
	let sandbox: sinon.SinonSandbox;
	let collector: CollectorInterface;
	let dispatcher: DispatcherInterface;

	class DummyCollector extends Service implements CollectorInterface {
		adapters = [];
		async count() {
			return 0;
		}
		async push() {}
		async pop() {
			return [];
		}
		async unshift() {}
		async shift() {
			return [];
		}
	}

	class DummyDispatcher extends Dispatcher {
		@inject('dummy-collector')
		public collector!: CollectorInterface;

		async dispatch(items: any[]) {
			return items;
		}
	}

	setupTest(hooks);

	hooks.beforeEach(async function(this: TestContext) {
		sandbox = sinon.createSandbox({ useFakeTimers: true });

		this.owner.register('service:dummy-collector', DummyCollector);
		this.owner.register('service:dummy-dispatcher', DummyDispatcher);

		collector = this.owner.lookup('service:dummy-collector');
		dispatcher = this.owner.lookup('service:dummy-dispatcher');
	});

	test('it exists', (assert) => {
		assert.ok(dispatcher);
	});

	test('it has default values', (assert) => {
		assert.notOk(dispatcher.isRunning, 'dispatcher is not running');
		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');
		assert.equal(dispatcher.maxTimeout, MAX_TIMEOUT, 'value is expected');
		assert.equal(dispatcher.maxConcurrent, MAX_CONCURRENT, 'value is expected');
	});

	test('default values can be predefined', (assert) => {
		const klass = DummyDispatcher.extend({
			maxTimeout: 1,
			maxConcurrent: 1
		});
		const instance = klass.create();

		assert.equal(instance.maxTimeout, 1, 'maxTimeout is predefined');
		assert.equal(instance.maxConcurrent, 1, 'maxConcurrent is predefined');
	});

	test('it starts dispatcher', async(assert) => {
		await dispatcher.start();

		assert.ok(dispatcher.isRunning, 'dispatcher is running');
	});

	test('it stops dispatcher', async(assert) => {
		await dispatcher.start();
		await dispatcher.stop();

		assert.notOk(dispatcher.isRunning, 'dispatcher is running');
	});

	test('it dispatches on timeout when has items', async(assert) => {
		const items = [1, 2, 3];

		dispatcher.maxTimeout = 30000;
		dispatcher.maxConcurrent = 50;

		collector.shift = sandbox.stub().resolves(items);
		dispatcher.dispatch = sandbox.stub().resolves([]);

		await dispatcher.start();

		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');

		sandbox.clock.tick(15000);

		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');

		sandbox.clock.tick(15000);

		assert.ok(dispatcher.isDispatching, 'dispatcher is dispatching');

		await waitUntil(() => !dispatcher.isDispatching);

		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');
		assert.ok((collector.shift as SinonStub).calledWith(50));
		assert.ok((dispatcher.dispatch as SinonStub).calledWith(items));
	});

	test('it does not dispatch on timeout when has no items', async(assert) => {
		dispatcher.maxTimeout = 30000;

		collector.shift = sandbox.stub().resolves([]);
		dispatcher.dispatch = sandbox.spy();

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');
		assert.ok((collector.shift as SinonStub).calledWith(50));
		assert.ok((dispatcher.dispatch as SinonSpy).notCalled);
	});

	test('it does not dispatches when is stopped', async(assert) => {
		const items = [1, 2, 3];

		dispatcher.maxTimeout = 30000;
		dispatcher.maxConcurrent = 50;

		collector.shift = sandbox.stub().resolves(items);
		dispatcher.dispatch = sandbox.spy();

		await dispatcher.start();
		await dispatcher.stop();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.notOk(dispatcher.isDispatching, 'dispatcher is not dispatching');
		assert.ok((collector.shift as SinonStub).notCalled);
		assert.ok((dispatcher.dispatch as SinonSpy).notCalled);
	});

	test('it inserts not dispatched items into collector', async(assert) => {
		const items = [1, 2, 3];

		dispatcher.maxTimeout = 30000;
		dispatcher.maxConcurrent = 50;

		collector.shift = sandbox.stub().resolves(items);
		collector.unshift = sandbox.spy();
		dispatcher.dispatch = sandbox.stub().resolves([1, 2]);

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.ok((collector.unshift as SinonSpy).calledWith(1, 2));
	});

	test('it dispatches multiple time when has enough items', async(assert) => {
		dispatcher.maxTimeout = 30000;
		dispatcher.maxConcurrent = 2;

		collector.shift = sandbox.stub();
		dispatcher.dispatch = sandbox.stub().resolves([]);

		(collector.shift as SinonStub).onCall(0).resolves([1, 2]);
		(collector.shift as SinonStub).onCall(1).resolves([3]);

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.ok((collector.shift as SinonStub).calledWith(2));
		assert.ok((dispatcher.dispatch as SinonSpy).calledWith([1, 2]));

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.ok((collector.shift as SinonStub).calledWith(2));
		assert.ok((dispatcher.dispatch as SinonSpy).calledWith([3]));
	});

	test('it dispatches items inserted after being empty', async(assert) => {
		dispatcher.maxTimeout = 30000;
		dispatcher.maxConcurrent = 50;

		collector.shift = sandbox.stub();
		dispatcher.dispatch = sandbox.stub().resolves([]);

		(collector.shift as SinonStub).onCall(0).resolves([]);
		(collector.shift as SinonStub).onCall(1).resolves([1, 2]);

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.ok((dispatcher.dispatch as SinonSpy).calledOnceWith([1, 2]));
	});
});

