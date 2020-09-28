import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export default class LocalStorage extends EmberObject {
	constructor() {
		super(...arguments);

		if (!this.key) {
			throw new Error('LocalStorage storage adapter needs a key');
		}

		this.db = window.localStorage;
	}

	async isSupported() {
		try {
			this.db.setItem('supported', '0');
			this.db.removeItem('supported');
		} catch (e) {
			return false;
		}

		return true;
	}

	async setItems(items) {
		this.db.setItem(this.key, JSON.stringify(items));
	}

	getItems() {
		const storage = this.db.getItem(this.key);

		return storage ? JSON.parse(storage) : [];
	}

	async count() {
		return this.getItems().length;
	}

	async push(...items) {
		const storedItems = this.getItems();

		items.forEach((item) => {
			storedItems.push(item);
		});

		await this.setItems(storedItems);
	}

	async unshift(...items) {
		const storedItems = this.getItems();

		items.forEach((item) => {
			storedItems.unshift(item);
		});

		await this.setItems(storedItems);
	}

	async pop(count = 1) {
		const storedItems = this.getItems();
		const items = storedItems.splice(-count);

		await this.setItems(storedItems);

		return items;
	}

	async shift(count = 1) {
		const storedItems = this.getItems();
		const items = storedItems.splice(0, count);

		await this.setItems(storedItems);

		return items;
	}
}

