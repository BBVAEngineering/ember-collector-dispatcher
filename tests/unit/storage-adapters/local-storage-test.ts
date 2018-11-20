import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | StorageAdapter | local-storage', (hooks) => {
	setupTest(hooks);

	test('it exists', function(assert) {
		const storage = this.owner.lookup('storage-adapter:local-storage');

		assert.ok(storage);
	});
});

