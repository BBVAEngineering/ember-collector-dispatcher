import BaseAdapter from './base';
import Dexie from 'Dexie';

export default BaseAdapter.extend({
	dbName: 'database',
	tableName: 'logs',
	db: null,
	version: '1',
	schema: {
		logs: '++_id'
	},

	init() {
		const dbName = this.get('dbName');
		const version = this.get('verion');
		const schema = this.get('schema');
		const db = new Dexie(dbName);

		db.version(version).stores(schema);
		db.open();

		this.set('db', db);
	},

	async push(items = []) {
		const db = this.get('db');
		const tableName = this.get('tableName');
		const currentTable = db[tableName];

		return db.transaction('rw', currentTable, () => {
			currentTable.bulkAdd(items);

			return currentTable.toArray();
		}).catch((e) => {
			console.log(e, 'pushing items error');
		});
	},

	async unshift(items = []) {
		const db = this.get('db');
		const tableName = this.get('tableName');
		const currentTable = db[tableName];
		const firstItem = await currentTable.toCollection().first();

		return db.transaction('rw', currentTable, () => {
			let _id = firstItem._id - 1;

			items.reverse().each((item) => {
				currentTable.add(Object.assign({}, item, { _id }));
				--_id;
			});

			return currentTable.toArray();
		}).catch((e) => {
			console.log(e, 'pushing items error');
		});
	},

	async pop() {
		const db = this.get('db');
		const tableName = this.get('tableName');
		const currentTable = db[tableName];
		const lastItem = await currentTable.toCollection().last();

		return currentTable.delete(lastItem._id).then(() => lastItem).catch((e) => {
			console.log(e, 'pushing items error');
		});
	},

	async shift() {
		const db = this.get('db');
		const tableName = this.get('tableName');
		const currentTable = db[tableName];
		const firstItem = await currentTable.toCollection().first();

		return currentTable.delete(firstItem._id).then(() => firstItem).catch((e) => {
			console.log(e, 'pushing items error');
		});
	}
});
