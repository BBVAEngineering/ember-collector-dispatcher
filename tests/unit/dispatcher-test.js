import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';
import waitUntil from '@ember/test-helpers/wait-until';

const DEFAULT_CONFIG = {
	dispatcherPath: 'examples/timeout.js',
	maxTimeout: 30000
};

const CollectorService = Service.extend({
	async count() {
		return this.content.length;
	},
	async push() {
		this.content.push(...arguments);

		return true;
	},
	async pop() {
		return this.content.pop();
	},
	async unshift() {
		this.content.unshift(...arguments);

		return true;
	},
	async shift() {
		return this.content.shift();
	}
});

moduleFor('service:dispatcher', 'Unit | Services | dispatcher', {
	beforeEach() {
		this.sandbox = sinon.createSandbox({
			useFakeTimers: true
		});
		this.collector = CollectorService.create({
			content: []
		});
		this.register('service:worker', Service.extend({}));
		this.registry.register('service:collector', this.collector, { instantitate: false });
	},
	afterEach() {
		this.sandbox.restore();
	}
});

test('it exists', function(assert) {
	assert.expect(0);

	this.subject({
		config: DEFAULT_CONFIG
	});
});

test('it is not running by default', async function(assert) {
	const service = this.subject({
		config: DEFAULT_CONFIG
	});

	assert.notOk(service.get('_isRunning'), 'service is not running');
});

test('it starts dispatcher', async function(assert) {
	const service = this.subject({
		config: DEFAULT_CONFIG
	});

	await service.start();

	assert.ok(service.get('_isRunning'), 'service is running');
});

test('it stops dispatcher', async function(assert) {
	const service = this.subject({
		config: DEFAULT_CONFIG
	});

	await service.start();

	await service.stop();

	assert.notOk(service.get('_isRunning'), 'service is not running');
});

test('it dispatches on timeout', async function(assert) {
	const config = {
		dispatcherPath: 'examples/timeout.js',
		maxTimeout: 30000
	};

	await this.service.start(config);

	assert.notOk(this.service.get('isDispatching'), 'service is not dispatching');

	this.sandbox.clock.tick(15000);

	assert.notOk(this.service.get('isDispatching'), 'service is not dispatching');

	this.sandbox.clock.tick(15000);

	assert.ok(this.service.get('isDispatching'), 'service is dispatching');
});

test('it does not dispatches when is stopped', async function(assert) {
	const config = {
		dispatcherPath: 'examples/timeout.js',
		maxTimeout: 30000
	};

	await this.service.start(config);
	await this.service.stop(config);

	this.sandbox.clock.tick(30000);

	assert.notOk(this.service.get('isDispatching'), 'service is not dispatching');
});

test('it asserts when dispatcher path is empty', function(assert) {
	assert.throws(() => {
		this.subject({
			config:{
				maxTimeout: 30000
			}
		});
	});
});

test('it calls dispatcher with collector items and stores received items on collector', async function(assert) {
	const config = {
		dispatcherPath: 'examples/reverse.js',
		maxTimeout: 30000
	};

	this.collector.content = [1, 2, 3];

	await this.service.start(config);

	this.sandbox.clock.tick(30000);

	await waitUntil(() => !this.service.get('isDispatching'));

	assert.equal(this.collector.content, [3, 2, 1], 'dispatcher has returned items to collector');
});

test('it calls dispatcher with max items', async function(assert) {
	const config = {
		dispatcherPath: 'examples/reverse.js',
		maxTimeout: 30000,
		maxConcurrent: 5
	};

	this.collector.content = [1, 2, 3, 4, 5, 6];

	await this.service.start(config);

	this.sandbox.clock.tick(30000);

	await waitUntil(() => !this.service.get('isDispatching'));

	assert.equal(this.collector.content, [5, 4, 3, 2, 1, 6], 'dispatcher has returned items to collector');
});

test('it does not insert items on collector', async function(assert) {
	const config = {
		dispatcherPath: 'examples/empty.js',
		maxTimeout: 30000
	};

	this.collector.content = [1, 2, 3];

	await this.service.start(config);

	this.sandbox.clock.tick(30000);

	await waitUntil(() => !this.service.get('isDispatching'));

	assert.equal(this.collector.content, [], 'dispatcher has returned items to collector');
});

test('it sends config to dispatcher', async function(assert) {
	const config = {
		dispatcherPath: 'examples/params.js',
		maxTimeout: 30000
	};
	const params = {
		foo: 'bar'
	};

	await this.service.start(config);

	this.service.setParams(params);

	this.sandbox.clock.tick(30000);

	await waitUntil(() => !this.service.get('isDispatching'));

	assert.deepEqual(this.collector.content, [[], params], 'dispatcher has returned items to collector');
});
