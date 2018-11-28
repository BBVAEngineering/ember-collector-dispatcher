import Service from '@ember/service';
import { StorageAdapterInterface } from '../storage-adapters/storage-adapter';
import { getOwner } from '@ember/application';

export type AdapterConfiguration = string | [string, any];

export interface CollectorInterface extends Service {
	adapters: AdapterConfiguration[]
	count(): Promise<number>;
	push(...items: any[]): Promise<void>;
	unshift(...items: any[]): Promise<void>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

export default abstract class Collector extends Service implements CollectorInterface {
	public abstract adapters: any[];
	private storageAdapter!: StorageAdapterInterface;

	private async setup() {
		if (!this.adapters) {
			throw new Error('You must define `adapters` property on your configuration');
		}

		const supportedAdapter = await this.getAdapter();

		if (!supportedAdapter) {
			throw new Error('You must define any supported adapter: indexed-db, local-storage or memory');
		}

		this.storageAdapter = supportedAdapter;
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
		if (!this.storageAdapter) {
			await this.setup();
		}

		return this.storageAdapter.count();
	}

	async push(...items: any[]) {
		if (!this.storageAdapter) {
			await this.setup();
		}

		return this.storageAdapter.push(...items);
	}

	async unshift(...items: any[]) {
		if (!this.storageAdapter) {
			await this.setup();
		}

		return this.storageAdapter.unshift(...items);
	}

	async pop(count?: number) {
		if (!this.storageAdapter) {
			await this.setup();
		}

		return this.storageAdapter.pop(count);
	}

	async shift(count?: number) {
		if (!this.storageAdapter) {
			await this.setup();
		}

		return this.storageAdapter.shift(count);
	}
}

declare module '@ember/service' {
	interface Registry {
		'collector': CollectorInterface;
	}
}
