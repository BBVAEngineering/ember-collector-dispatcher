function timeout(time) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

self.dispatch = async function() {
	await timeout(1000);

	return [];
};
