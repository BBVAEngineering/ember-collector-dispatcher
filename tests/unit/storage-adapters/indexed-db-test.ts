import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | StorageAdapter | indexed-db', (hooks) => {
	setupTest(hooks);

	test('it exists', function(assert) {
		const storage = this.owner.lookup('storage-adapter:indexed-db');

		assert.ok(storage);
	});
});

