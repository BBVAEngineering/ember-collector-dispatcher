import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface MemoryInterface extends StorageAdapterInterface {}

export default class Memory extends EmberObject {
	private memory: Array<Object>;

	constructor() {
		super(...arguments);

		this.memory = [];
	}

	isSupported(this: Memory){
		return true;
	}

	count(this: Memory) {
		return new Promise((resolve) => resolve(this.memory.length));
	}

	push(this: Memory, ...items: any[]) {
		return new Promise((resolve) => {
			items.forEach((item) => { this.memory.push(item); });
			resolve();
		});
	}

	unshift(this: Memory, ...items: any[]) {
		return new Promise((resolve) => {
			items.forEach((item) => { this.memory.unshift(item); });

			resolve();
		});
	}

	pop(this: Memory, count?: number) {
		return new Promise((resolve) => {
			const times = count || 1;
			resolve(this.memory.splice(-times));
		});
	}

	shift(this: Memory, count?: number) {
		return new Promise((resolve) => {
			const times = count || 1;
			resolve(this.memory.splice(0, times));
		});
	}

}

