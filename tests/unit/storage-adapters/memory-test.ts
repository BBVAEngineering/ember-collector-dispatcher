import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | StorageAdapter | memory', (hooks) => {
	setupTest(hooks);

	test('it exists', function(assert) {
		const storage = this.owner.lookup('storage-adapter:memory');

		assert.ok(storage);
	});
});

