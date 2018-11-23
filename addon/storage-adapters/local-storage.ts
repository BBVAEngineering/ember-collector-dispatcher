import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface LocalStorageInterface extends StorageAdapterInterface {
	key: string;
}

export default class LocalStorage extends EmberObject implements LocalStorageInterface {
	public key!: string;
	private db: Storage;

	constructor() {
		super(...arguments);

		this.db = window.localStorage;
	}

	async isSupported() {
		try {
			window.localStorage.setItem('supported', '0');
			window.localStorage.removeItem('supported');
		} catch (e) {
			return false;
		}

		return true;
	}

	private async setItems(this: LocalStorage, items: any[]) {
		this.db.setItem(this.key, JSON.stringify(items));
	}

	private getItems(this: LocalStorage) {
		const storage = this.db.getItem(this.key);

		return storage ? JSON.parse(storage) : [];
	}

	async count(this: LocalStorage) {
		return this.getItems().length;
	}

	async push(this: LocalStorage, ...items: any[]) {
		const storedItems = this.getItems();

		items.forEach((item) => {storedItems.push(item);});

		await this.setItems(storedItems);
	}

	async unshift(this: LocalStorage, ...items: any[]) {
		const storedItems = this.getItems();

		items.forEach((item) => {storedItems.unshift(item);});

		await this.setItems(storedItems);
	}

	async pop(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this.getItems();
		const items = storedItems.splice(-times);

		await this.setItems(storedItems);

		return items;
	}

	async shift(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this.getItems();
		const items = storedItems.splice(0, times);

		await this.setItems(storedItems);

		return items;
	}
}

