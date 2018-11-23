import Service from '@ember/service';
import { StorageAdapterInterface } from '../storage-adapters/storage-adapter';
import { getOwner } from '@ember/application';

export interface CollectorInterface extends Service {
	storageAdapter: StorageAdapterInterface;
	setup(): Promise<void>;
	count(): Promise<number>;
	push(...items: any[]): Promise<void>;
	unshift(...items: any[]): Promise<void>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

export default class Collector extends Service {
	private storageAdapter: Promise<StorageAdapterInterface>;
	public adapters!: any[];

	constructor() {
		super(...arguments);

		if (!this.adapters) {
			throw new Error('You must define `adapters` property on your configuration');
		}

		this.storageAdapter = this.getAdapter();
	}

	private async getAdapter() {
		let supportedAdapter;
		let options;

		supportedAdapter = await this.findAdapter() || 'memory';

		if (!supportedAdapter) {
			throw new Error('You must define any supported adapter: indexed-db, local-storage or memory');
		}

		if (Array.isArray(supportedAdapter)) {
			options = supportedAdapter[1];
			supportedAdapter = supportedAdapter[0];
		}

		return getOwner(this).factoryFor(`storage-adapter:${supportedAdapter}`).create(options);
	}

	private async findAdapter() {
		const owner = getOwner(this);
		let supported;

		for (let i = 0; i < this.adapters.length; i++) {
			const adapter = this.adapters[i];
			const name = Array.isArray(adapter) ? adapter[0] : adapter;

			if (await owner.factoryFor(`storage-adapter:${name}`).isSupported()) {
				supported = adapter;
				break;
			}
		}
		return supported;
	}

	async count() {
		const adapter = await this.storageAdapter;

		return adapter.count();
	}

	async push(...items: any[]) {
		const adapter = await this.storageAdapter;

		return adapter.push(items);
	}

	async unshift(...items: any[]) {
		const adapter = await this.storageAdapter;

		return adapter.unshift(items);
	}

	async pop(count?: number) {
		const adapter = await this.storageAdapter;

		return adapter.pop(count);
	}

	async shift(count?: number) {
		const adapter = await this.storageAdapter;

		return adapter.shift(count);
	}
}

declare module '@ember/service' {
	interface Registry {
		'collector': CollectorInterface;
	}
}
