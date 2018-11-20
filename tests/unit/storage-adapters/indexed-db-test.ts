import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import { IndexedDbInterface, schema, version, tableName } from 'ember-iniesta/storage-adapters/indexed-db';
import Dexie from 'dexie';

async function setupIndexedDb(dbName: string) {
	const db = new Dexie(dbName);

	db.version(version).stores(schema);

	const table = db.table(tableName);

	await table.clear();

	return table;
}

module('Unit | StorageAdapter | indexed-db', (hooks) => {
	const dbName = 'database';
	let storage: IndexedDbInterface;
	let table: Dexie.Table<any, number>;

	setupTest(hooks);

	hooks.beforeEach(async function(this: TestContext) {
		storage = this.owner.lookup('storage-adapter:indexed-db');
		storage.database = dbName;

		table = await setupIndexedDb(dbName);
	});

	test('it exists', (assert) => {
		assert.ok(storage);
	});

	skip('it returns count of items', async(assert) => {
		await table.bulkAdd([{ _id: 1 }, { _id: 2 }]);

		const count = await storage.count();

		assert.equal(count, 2, 'count is expected');
	});

	skip('it pushes an item', async(assert) => {
		await storage.push({ foo: 'bar' });

		const count = await table.count();

		assert.equal(count, 1, 'item exists');
	});

	skip('it pushes several items', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const count = await table.count();

		assert.equal(count, 2, 'items exist');
	});

	skip('it unshifts an item', async(assert) => {
		await storage.unshift({ foo: 'bar' });

		const count = table.count();

		assert.equal(count, 1, 'item exists');
	});

	skip('it unshifts several items', async(assert) => {
		await storage.unshift({ foo: 'bar' }, { bar: 'foo' });

		const count = await table.count();

		assert.equal(count, 2, 'items exist');
	});

	skip('it returns count of items', async(assert) => {
		await table.bulkAdd([{ _id: 1, foo: 'bar' }]);

		const [item] = await storage.pop();

		assert.deepEqual(item, { foo: 'bar' }, 'item is expected');
	});
});

