import Service from '@ember/service';
import { StorageAdapterInterface } from '../storage-adapters/storage-adapter';
import { getOwner } from '@ember/application';

export interface CollectorInterface extends Service {
	storageAdapter: StorageAdapterInterface;
	count(): Promise<number>;
	push(...items: any[]): Promise<void>;
	unshift(...items: any[]): Promise<void>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

export default class Collector extends Service {
	private storageAdapter!: StorageAdapterInterface;
	public adapters!: any[];

	constructor(){
		super(...arguments);

		if (!this.adapters) {
			throw new Error('You must define `adapters` property on your configuration');
		}

		// let supportedAdapter;
		// let options;

		// supportedAdapter = this._getAdapter();

		// if (!supportedAdapter) {
		// 	throw new Error('You must define any supported adapter: indexed-db, local-storage or memory');
		// }

		// if (supportedAdapter[0]) {
		// 	options = supportedAdapter[1];
		// 	supportedAdapter = supportedAdapter[0];
		// }

		// this.storageAdapter = getOwner(this).factoryFor(`storage-adapter:${supportedAdapter}`).create(options);
	}

	// async _getAdapter() {
	// 	return this.adapters.find((adapter: string | any[]) => {
	// 		return getOwner(this).factoryFor(`storage-adapter:${adapter[0] || adapter}`).isSupported();
	// 	});
	// }

	count() {
		return this.storageAdapter.count();
	}

	push(...items: any[]) {
		return this.storageAdapter.push(items);
	}

	unshift(...items: any[]) {
		return this.storageAdapter.unshift(items);
	}

	pop(count?: number) {
		return this.storageAdapter.pop(count);
	}

	shift(count?: number) {
		return this.storageAdapter.shift(count);
	}

}

declare module '@ember/service' {
  interface Registry {
    'collector': CollectorInterface;
  }
}
