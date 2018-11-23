import Service from '@ember/service';
import { StorageAdapterInterface } from '../storage-adapters/storage-adapter';
import { getOwner } from '@ember/application';

export interface CollectorInterface extends Service {
	storageAdapter: StorageAdapterInterface;
	setup(): Promise<StorageAdapterInterface>;
	count(): Promise<number>;
	push(...items: any[]): Promise<void>;
	unshift(...items: any[]): Promise<void>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

export default abstract class Collector extends Service implements CollectorInterface {
	public storageAdapter!: StorageAdapterInterface;
	public adapters!: any[];

	async setup() {
		if (!this.adapters) {
			throw new Error('You must define `adapters` property on your configuration');
		}

		if (!this.storageAdapter) {
			const supportedAdapter = await this.getAdapter();

			if (!supportedAdapter) {
				throw new Error('You must define any supported adapter: indexed-db, local-storage or memory');
			}

			this.storageAdapter = supportedAdapter;
		}

		return this.storageAdapter;
	}

	private async getAdapter() {
		const owner = getOwner(this);
		let supported;

		for (let i = 0; i < this.adapters.length; i++) {
			let current = this.adapters[i];
			let options;

			if (Array.isArray(current)) {
				options = current[1];
				current = current[0];
			}

			const adapter = owner.factoryFor(`storage-adapter:${current}`).create(options);

			if (await adapter.isSupported()) {
				supported = adapter;
				break;
			}

			adapter.destroy();
		}

		return supported;
	}

	async count() {
		const adapter = await this.setup();

		return adapter.count();
	}

	async push(...items: any[]) {
		const adapter = await this.setup();

		return adapter.push(...items);
	}

	async unshift(...items: any[]) {
		const adapter = await this.setup();

		return adapter.unshift(...items);
	}

	async pop(count?: number) {
		const adapter = await this.setup();

		return adapter.pop(count);
	}

	async shift(count?: number) {
		const adapter = await this.setup();

		return adapter.shift(count);
	}
}

declare module '@ember/service' {
	interface Registry {
		'collector': CollectorInterface;
	}
}
