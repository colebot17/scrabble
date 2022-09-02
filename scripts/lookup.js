function dictLookup(words, callback = function(entries) {}) {
	let entries = [];
	let promises = [
		...words.map(x => $.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + x, function(def) {
			entries.push(def);
		})),
		new Promise(function (resolve) {
			function res() {
				document.removeEventListener('mouseup', res);
				document.removeEventListener('touchend', res);
				resolve();
			}
			document.addEventListener('mouseup', res);
			document.addEventListener('touchend', res);
		})
	];
	Promise.allSettled(promises).then(() => {
		if (entries.length > 0) {
			callback(entries);
		}
	});
}