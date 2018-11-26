import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import { LocalStorageInterface } from 'ember-iniesta/storage-adapters/local-storage';

module('Unit | StorageAdapter | local-storage', (hooks) => {
	const dbName = 'database';
	let storage: LocalStorageInterface;

	function setItems(items: any[]) {
		const str = JSON.stringify(items);

		window.localStorage.setItem(dbName, str);
	}

	function getItems() {
		const str = window.localStorage.getItem(dbName);

		if (!str) {
			return [];
		}

		return JSON.parse(str);
	}

	function countItems() {
		const items = getItems();

		return items.length;
	}

	setupTest(hooks);

	hooks.beforeEach(function(this: TestContext) {
		const factory = this.owner.factoryFor('storage-adapter:local-storage');

		storage = factory.create({ key: dbName });
	});

	hooks.afterEach(() => {
		if (window.localStorage) {
			window.localStorage.clear();
		}
	});

	test('it exists', (assert) => {
		assert.ok(storage);
	});

	test('it is supported', (assert) => {
		assert.ok(storage.isSupported(), 'storage is supported');
	});

	test('it checks when is not supported', async function(this: TestContext, assert) {
		const localStorage = window.localStorage;

		Object.defineProperty(window, 'localStorage', { value: undefined });

		const factory = this.owner.factoryFor('storage-adapter:local-storage');

		storage = factory.create({ key: dbName });

		assert.notOk(await storage.isSupported(), 'storage is not supported');

		Object.defineProperty(window, 'localStorage', { value: localStorage });
	});

	test('it throws an error when key is not defined', async function(this: TestContext, assert) {
		const factory = this.owner.factoryFor('storage-adapter:local-storage');

		assert.throws(() => {
			factory.create({ key: null });
		});
	});

	test('it returns count of items', async(assert) => {
		setItems([{ _id: 1 }, { _id: 2 }]);

		const count = await storage.count();

		assert.equal(count, 2, 'count is expected');
	});

	test('it pushes an item', async(assert) => {
		await storage.push({ foo: 'bar' });

		const count = countItems();

		assert.equal(count, 1, 'item exists');
	});

	test('it pushes several items', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const count = countItems();

		assert.equal(count, 2, 'items exist');
	});

	test('it unshifts an item', async(assert) => {
		await storage.unshift({ foo: 'bar' });

		const count = countItems();

		assert.equal(count, 1, 'item exists');
	});

	test('it unshifts several items', async(assert) => {
		await storage.unshift({ foo: 'bar' }, { bar: 'foo' });

		const count = countItems();

		assert.equal(count, 2, 'items exist');
	});

	test('it pushes an item and pops once', async(assert) => {
		await storage.push({ foo: 'bar' });

		const item = await storage.pop();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and pops once', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.pop();

		assert.deepEqual(item, [{ bar: 'foo' }], 'item is expected');
	});

	test('it pushes items and pops several times', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.pop(2);

		assert.deepEqual(item, [{ foo: 'bar' }, { bar: 'foo' }], 'item is expected');
	});

	test('it pushes an item and shifts once', async(assert) => {
		await storage.push({ foo: 'bar' });

		const item = await storage.shift();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and shifts once', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.shift();

		assert.deepEqual(item, [{ foo: 'bar' }], 'item is expected');
	});

	test('it pushes items and shifts several times', async(assert) => {
		await storage.push({ foo: 'bar' }, { bar: 'foo' });

		const item = await storage.shift(2);

		assert.deepEqual(item, [{ foo: 'bar' }, { bar: 'foo' }], 'item is expected');
	});
});

