import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface MemoryInterface extends StorageAdapterInterface {}

export default class Memory extends EmberObject implements MemoryInterface {
	private memory: Array<Object>;

	constructor() {
		super(...arguments);

		this.memory = [];
	}

	async isSupported() {
		return true;
	}

	async count(this: Memory) {
		return this.memory.length;
	}

	async push(this: Memory, ...items: any[]) {
		items.forEach((item) => this.memory.push(item));
	}

	async unshift(this: Memory, ...items: any[]) {
		items.forEach((item) => this.memory.unshift(item));
	}

	async pop(this: Memory, count: number = 1) {
		return this.memory.splice(-count);
	}

	async shift(this: Memory, count: number = 1) {
		return this.memory.splice(0, count);
	}
}

