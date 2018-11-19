import { moduleFor, test } from 'ember-qunit';

moduleFor('service:dispatcher', 'Unit | Services | dispatcher', {
	beforeEach() {
		this.config = {};
		this.register('config:environment', { iniesta: this.config }, { instantiate: false });
	}
});

// initial states.

test('it exists', function(assert) {
	assert.expect(0);

	this.subject();
});
