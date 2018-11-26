import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import Collector, { CollectorInterface } from 'ember-iniesta/services/collector';
import Dispatcher, { DispatcherInterface } from 'ember-iniesta/services/dispatcher';
import sinon, { SinonStub } from 'sinon';
import { service } from '@ember-decorators/service';
import waitUntil from '@ember/test-helpers/wait-until';
import Dexie from 'dexie';
import { schema, version, tableName } from 'ember-iniesta/storage-adapters/indexed-db';

declare module '@ember/service' {
	interface Registry {
		'main-collector': CollectorInterface;
	}
}

async function setupIndexedDb(dbName: string) {
	const db = new Dexie(dbName);

	db.version(version).stores(schema);

	const table = db.table(tableName);

	return table;
}

module('Integration | index', (hooks) => {
	const sandbox = sinon.createSandbox({ useFakeTimers: true });
	const dbName = 'main';
	let collector: CollectorInterface;
	let dispatcher: DispatcherInterface;
	let table: Dexie.Table<any, number>;

	setupTest(hooks);

	class MainCollector extends Collector {
		public adapters = [
			['indexed-db', { database: dbName }]
		];
	}

	class MainDispatcher extends Dispatcher {
		@service('main-collector')
		public collector!: CollectorInterface;
		public dispatch = sandbox.stub();
		public maxTimeout = 30000;
	}

	hooks.beforeEach(async function(this: TestContext) {
		this.owner.register('service:main-collector', MainCollector);
		this.owner.register('service:main-dispatcher', MainDispatcher);

		table = await setupIndexedDb(dbName);

		collector = this.owner.lookup('service:main-collector');
		dispatcher = this.owner.lookup('service:main-dispatcher');
	});

	hooks.afterEach(async() => {
		sandbox.reset();
		await table.clear();
	});

	test('it dispatches items', async(assert) => {
		const items = [{ id: 1 }, { id: 2 }];

		await collector.push(...items);

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.equal(await collector.count(), 0, 'collector is empty');
		assert.ok((dispatcher.dispatch as SinonStub).calledWith(items), 'dispatch is called with items');
	});

	test('it requeues non dispatched items into collector', async(assert) => {
		const items = [{ id: 1 }, { id: 2 }];
		const item = items.find((i) => i.id === 1);

		(dispatcher.dispatch as SinonStub).resolves([item]);

		await collector.push(...items);

		await dispatcher.start();

		sandbox.clock.tick(30000);

		await waitUntil(() => !dispatcher.isDispatching);

		assert.equal(await collector.pop(), [item], 'collector has item');
	});
});

