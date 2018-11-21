import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon, { SinonStub, SinonSpy } from 'sinon';
import { StorageAdapterInterface } from 'ember-iniesta/storage-adapters/storage-adapter';
import { CollectorInterface } from 'ember-iniesta/services/collector';
import { DispatcherInterface } from 'ember-iniesta/services/dispatcher';
import Service from '@ember/service';
import { TestContext } from 'ember-test-helpers';
import { MAX_TIMEOUT, MAX_CONCURRENT } from 'ember-iniesta/constants';
// import waitUntil from '@ember/test-helpers/wait-until';

interface ChannelInterface {
	postMessage(data: any): Promise<any>;
	terminate(): Promise<any>;
}

interface WorkerInterface {
	open(name: string): Promise<ChannelInterface>;
}

module('Unit | Service | dispatcher', (hooks) => {
	const dispatcherPath = 'examples/dummy.js';
	let sandbox: sinon.SinonSandbox;
	let collector: CollectorInterface;
	let worker: WorkerInterface;
	let service: DispatcherInterface;

	class DummyCollector extends Service implements CollectorInterface {
		public storageAdapter!: StorageAdapterInterface
		async count() {
			return 0;
		}
		async push() {
			return true;
		}
		async pop() {
			return [];
		}
		async unshift() {
			return true;
		}
		async shift() {
			return [];
		}
	}

	class DummyChannel implements ChannelInterface {
		async postMessage(data: any) {
			return data;
		}
		async terminate() {}
	}

	class DummyWorker extends Service implements WorkerInterface {
		async open() {
			return new DummyChannel();
		}
	}

	setupTest(hooks);

	hooks.beforeEach(async function(this: TestContext) {
		sandbox = sinon.createSandbox({ useFakeTimers: true });
		collector = new DummyCollector();
		worker = new DummyWorker();

		const subject = this.owner.factoryFor('service:dispatcher');

		service = subject.create({ collector, worker, dispatcherPath });
	});

	test('it exists', (assert) => {
		assert.ok(service);
	});

	skip('it has default values', (assert) => {
		assert.notOk(service.isRunning, 'service is not running');
		assert.notOk(service.isDispatching, 'service is not dispatching');
		assert.equal(service.maxTimeout, MAX_TIMEOUT, 'value is expected');
		assert.equal(service.maxConcurrent, MAX_CONCURRENT, 'value is expected');
	});

	skip('it throws an error when dispatcher path is empty', (assert) => {
		service.dispatcherPath = '';

		assert.throws(() => {
			service.start();
		});
	});

	skip('it starts dispatcher', async(assert) => {
		const channel = new DummyChannel();
		const options = { dispatcherPath };

		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();

		assert.ok(service.isRunning, 'service is running');
		assert.ok((worker.open as SinonStub).calledWith('dispatcher'), 'worker is open');
		assert.ok((channel.postMessage as SinonSpy).calledWith('install', { options }), 'worker is open');
	});

	skip('it stops dispatcher', async(assert) => {
		const channel = new DummyChannel();

		channel.terminate = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();
		await service.stop();

		assert.notOk(service.isRunning, 'service is running');
		assert.ok((channel.terminate as SinonSpy).calledOnce);
	});

	skip('it dispatches on timeout when has items', async(assert) => {
		const channel = new DummyChannel();
		const items = [1, 2, 3];

		service.maxTimeout = 30000;
		service.maxConcurrent = 50;

		collector.shift = sandbox.stub().returns(items);
		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();

		assert.notOk(service.isDispatching, 'service is not dispatching');
		assert.notOk((collector.shift as SinonStub).calledWith(50));
		assert.notOk((channel.postMessage as SinonSpy).calledWith('dispatch', { items }));

		sandbox.clock.tick(15000);

		assert.notOk(service.isDispatching, 'service is not dispatching');
		assert.notOk((collector.shift as SinonStub).calledWith(50));
		assert.notOk((channel.postMessage as SinonSpy).calledWith('dispatch', { items }));

		sandbox.clock.tick(15000);

		assert.ok(service.isDispatching, 'service is dispatching');
		assert.ok((collector.shift as SinonStub).calledWith(50));
		assert.ok((channel.postMessage as SinonSpy).calledWith('dispatch', { items }));
	});

	skip('it does not dispatch on timeout when has no items', async(assert) => {
		const channel = new DummyChannel();

		service.maxTimeout = 30000;

		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();

		sandbox.clock.tick(30000);

		assert.notOk(service.isDispatching, 'service is not dispatching');
		assert.ok((channel.postMessage as SinonSpy).notCalled);
	});

	skip('it does not dispatches when is stopped', async(assert) => {
		const channel = new DummyChannel();
		const items = [1, 2, 3];

		service.maxTimeout = 30000;
		service.maxConcurrent = 50;
		collector.shift = sandbox.stub().returns(items);

		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();
		await service.stop();

		sandbox.clock.tick(30000);

		assert.notOk(service.isDispatching, 'service is not dispatching');
		assert.ok((collector.shift as SinonStub).notCalled);
		assert.ok((channel.postMessage as SinonSpy).notCalled);
	});

	skip('it gives options to dispatcher', async(assert) => {
		const channel = new DummyChannel();
		const items = [1, 2, 3];
		const options = { foo: 'bar' };

		service.maxTimeout = 30000;
		service.maxConcurrent = 50;
		collector.shift = sandbox.stub().returns(items);

		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		service.setOptions(options);

		await service.start();

		sandbox.clock.tick(30000);

		assert.notOk((collector.shift as SinonStub).calledWith(50));
		assert.ok((channel.postMessage as SinonSpy).calledWith('dispatch', { items, options }));
	});

	skip('it dispatches multiple time when has enough items', async(assert) => {
		const channel = new DummyChannel();

		service.maxTimeout = 30000;
		service.maxConcurrent = 2;
		collector.shift = sandbox.stub();

		(collector.shift as SinonStub).onCall(0).returns([1, 2]);
		(collector.shift as SinonStub).onCall(1).returns([3]);

		channel.postMessage = sandbox.spy();
		worker.open = sandbox.stub().resolves(channel);

		await service.start();

		sandbox.clock.tick(30000);

		assert.ok((collector.shift as SinonStub).calledWith(2));
		assert.ok((channel.postMessage as SinonSpy).calledWith('dispatch', { items: [1, 2] }));

		sandbox.clock.tick(30000);

		assert.ok((collector.shift as SinonStub).calledWith(2));
		assert.ok((channel.postMessage as SinonSpy).calledWith('dispatch', { items: [3] }));
	});
});

