import EmberObject from '@ember/object';
import { assert } from '@ember/debug';

export default EmberObject.extend({
	init() {
		assert('Must implement the init hook!');
	},
	count() {},
	push() {},
	unshift() {},
	pop() {},
	shift() {}
});
