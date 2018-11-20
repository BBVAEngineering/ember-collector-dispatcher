import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | dispatcher', (hooks) => {
	setupTest(hooks);

	test('it exists', function(assert) {
		const service = this.owner.lookup('service:dispatcher');

		assert.ok(service);
	});
});

