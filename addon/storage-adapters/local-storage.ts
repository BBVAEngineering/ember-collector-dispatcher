import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';
import { isPresent } from '@ember/utils';

export interface LocalStorageInterface extends StorageAdapterInterface {
	key: string;
}

export default class LocalStorage extends EmberObject implements LocalStorageInterface {
	public key!: string;
	private db: Storage;

	constructor(this: LocalStorage) {
		super(...arguments);

		this.db = window.localStorage;
		this.db.setItem(this.key, JSON.stringify([]));
	}

	_setItems(this: LocalStorage, items: any[]){
		return new Promise((resolve, reject) => {
			let exception;
			try {
				this.db.setItem(this.key, JSON.stringify(items))
			} catch (e){
				exception = e;
			}
			return isPresent(exception) ? reject(exception) : resolve();
		});
	}

	_getItems(this: LocalStorage){
		const storage = this.db.getItem(this.key);

		return storage ? JSON.parse(storage) : [];
	}

	count(this: LocalStorage) {
		return new Promise((resolve) => resolve(this._getItems().length));
	}

	push(this: LocalStorage, ...items: any[]) {
		const storedItems = this._getItems();

		items.forEach((item) => { storedItems.push(item); });

		return this._setItems(storedItems);
	}

	unshift(this: LocalStorage, ...items: any[]) {
		const storedItems = this._getItems();

		items.forEach((item) => { storedItems.unshift(item); });

		return this._setItems(storedItems);
	}

	pop(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this._getItems();
		const items = storedItems.splice(-times);

		return this._setItems(storedItems).then(() => items);
	}

	shift(this: LocalStorage, count?: number) {
		const times = count || 1;
		const storedItems = this._getItems();
		const items = storedItems.splice(0, times);

		return this._setItems(storedItems).then(() => items);
	}
}

