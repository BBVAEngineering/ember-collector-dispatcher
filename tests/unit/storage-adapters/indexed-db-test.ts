import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import { IndexedDbInterface, schema, version, tableName } from 'ember-iniesta/storage-adapters/indexed-db';
import Dexie from 'dexie';

async function setupIndexedDb(dbName: string) {
	const db = new Dexie(dbName);

	db.version(version).stores(schema);

	const table = db.table(tableName);

	return table;
}

module('Unit | StorageAdapter | indexed-db', (hooks) => {
	const dbName = 'database';
	let storage: IndexedDbInterface;
	let table: Dexie.Table<any, number>;

	setupTest(hooks);

	hooks.beforeEach(async function (this: TestContext) {
		const factory = this.owner.factoryFor('storage-adapter:indexed-db');

		storage = factory.create({ database: dbName });

		table = await setupIndexedDb(dbName);
	});

	hooks.afterEach(async () => {
		if(table.schema){
			await table.clear();
		}
	});

	test('it exists', (assert) => {
		assert.ok(storage, 'service exists');
	});

	test('it is supported', async (assert) => {
		assert.ok(await storage.isSupported(), 'storage is supported');
	});

	test('it checks when is not supported', async function (this: TestContext, assert) {
		const indexedDB = Dexie.dependencies.indexedDB;

		Dexie.dependencies.indexedDB = (null as unknown) as IDBFactory;

		const factory = this.owner.factoryFor('storage-adapter:indexed-db');

		storage = factory.create({ database: dbName });

		assert.notOk(await storage.isSupported(), 'storage is not supported');

		Dexie.dependencies.indexedDB = indexedDB;
	});

	test('it returns count of items', async (assert) => {
		await table.bulkAdd([{ _id: 1 }, { _id: 2 }]);

		const count = await storage.count();

		assert.equal(count, 2, 'count is expected');
	});

	test('it pushes an item', async (assert) => {
		await storage.push({ foo: 'bar' });

		const count = await table.count();

		assert.equal(count, 1, 'item exists');
	});

	test('it pushes several items', async (assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const count = await table.count();

		assert.equal(count, 2, 'items exist');
	});

	test('it unshifts an item', async (assert) => {
		await storage.unshift({ foo: 'bar' });

		const count = await table.count();

		assert.equal(count, 1, 'item exists');
	});

	test('it unshifts several items', async (assert) => {
		await storage.unshift({ foo: 'bar' }, { bar: 'foo' });

		const count = await table.count();

		assert.equal(count, 2, 'items exist');
	});

	test('it pushes an item and pops once', async (assert) => {
		await storage.push({ foo: 'bar' });

		const item = await storage.pop();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and pops once', async (assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.pop();

		assert.deepEqual(item, [{ bar: 'foo' }], 'item is expected');
	});

	test('it pushes items and pops several times', async (assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.pop(2);

		assert.deepEqual(item, [{ bar: 'foo' }, { foo: 'bar' }], 'item is expected');
	});

	test('it pushes an item and shifts once', async (assert) => {
		await storage.push({ foo: 'bar' });

		const item = await storage.shift();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and shifts once', async (assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.shift();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and shifts several times', async (assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.shift(2);

		assert.deepEqual(item, [{ foo: 'bar' }, { bar: 'foo' }], 'item is expected');
	});
});

