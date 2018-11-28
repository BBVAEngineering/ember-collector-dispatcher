import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';
import { isPresent } from '@ember/utils';
import Dexie from 'dexie';

export const version = 1;
export const tableName = 'logs';
export const schema = {
	[tableName]: '++_id'
};

export interface IndexedDbInterface extends StorageAdapterInterface {
	database: string;
}

export default class IndexedDb extends EmberObject implements IndexedDbInterface {
	public database!: string;
	private db!: Dexie;
	private table!: Dexie.Table<any, number>;

	init() {
		this._super(...arguments);

		if (!this.database) {
			throw new Error('IndexedDB storage adapter needs a database');
		}

		const db = new Dexie(this.database);

		db.version(version).stores(schema);

		this.db = db;

		const table = db.table(tableName);

		this.table = table;
	}

	isSupported() {
		return this.db.open().then(() => true, () => false);
	}

	count(this: IndexedDb) {
		return this.table.count();
	}

	async push(this: IndexedDb, ...items: any[]) {
		this.table.bulkAdd(items);
	}

	async unshift(this: IndexedDb, ...items: any[]) {
		const length = await this.count();

		if (!length) {
			this.table.bulkAdd(items);
			return;
		}

		const firstItem = await this.table.toCollection().first();
		let _id = firstItem._id - 1;

		items.reverse().forEach((item) => {
			Object.assign(item, { _id });
			--_id;
		});

		this.table.bulkAdd(items);
	}

	private async removeItem(this: IndexedDb, pop?: boolean) {
		const collection = await this.table.toCollection();
		const currentItem = pop ? await collection.last() : await collection.first();

		if (isPresent(currentItem)) {
			await this.table.delete(currentItem._id);
			delete currentItem._id;

			return [currentItem];
		}

		return [];
	}

	async pop(this: IndexedDb, count: number = 1) {
		let result: any[] = [];

		await this.db.transaction('rw', this.table, async() => {
			for (let i = 0; i < count; i++) {
				const item = await this.removeItem(true);

				result = [...result, ...item];
			}
		});

		return result;
	}

	async shift(this: IndexedDb, count: number = 1) {
		let result: any[] = [];

		await this.db.transaction('rw', this.table, async() => {
			for (let i = 0; i < count; i++) {
				const item = await this.removeItem();

				result = [...result, ...item];
			}
		});

		return result;
	}
}

