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

	async _setItems(this: LocalStorage, items: any[]) {
		this.db.setItem(this.key, JSON.stringify(items));
	}

	_getItems(this: LocalStorage) {
		const storage = this.db.getItem(this.key);

		return storage ? JSON.parse(storage) : [];
	}

	async count(this: LocalStorage) {
		return this._getItems().length;
	}

	async push(this: LocalStorage, ...items: any[]) {
		const storedItems = this._getItems();

		items.forEach((item) => {storedItems.push(item);});

		await this._setItems(storedItems);
	}

	async unshift(this: LocalStorage, ...items: any[]) {
		const storedItems = this._getItems();

		items.forEach((item) => {storedItems.unshift(item);});

		await this._setItems(storedItems);
	}

	async pop(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this._getItems();
		const items = storedItems.splice(-times);

		await this._setItems(storedItems);

		return items;
	}

	async shift(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this._getItems();
		const items = storedItems.splice(0, times);

		await this._setItems(storedItems);

		return items;
	}
}

