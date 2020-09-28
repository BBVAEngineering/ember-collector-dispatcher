import EmberObject from '@ember/object';

export default class Memory extends EmberObject {
	init() {
		super.init(...arguments);

		this.memory = [];
	}

	async isSupported() {
		return true;
	}

	async count() {
		return this.memory.length;
	}

	async push(...items) {
		items.forEach((item) => this.memory.push(item));
	}

	async unshift(...items) {
		items.forEach((item) => this.memory.unshift(item));
	}

	async pop(count = 1) {
		return this.memory.splice(-count);
	}

	async shift(count = 1) {
		return this.memory.splice(0, count);
	}
}

