function range() {
	let start, end, step;
	if (arguments.length === 1) {
		start = 0;
		end = arguments[0];
		step = 1;
	} else if (arguments.length === 2) {
		start = arguments[0];
		end = arguments[1];
		step = 1;
	} else if (arguments.length >= 3) {
		start = arguments[0];
		end = arguments[1];
		step = arguments[2];
	} else {
		throw new Error("range() must accept at least one argument");
	}

	if (step === 0) {
		throw new Error("step cannot be equal to zero");
	}

	if (start > stop && step > 0) {
		throw new Error("stop must be greater than start, or step must be negative");
	}

	if (start < stop && step < 0) {
		throw new Error("start must be greater than stop, or step must be positive");
	}

	let arr = [];

	for (let i = start; i < end; i += step) {
		arr.push(i);
	}

	return arr;
}

function request(filename, dataObj) {
	const url = location + '/php/' + filename;
	const data = new URLSearchParams(dataObj).toString();

	return new Promise((resolve, reject) => {
		const f = fetch(url, {
			method: 'POST',
			body: data,
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		});
		const onLine = new Promise((resolve, reject) => {
			if (navigator.onLine) {
				resolve();
			} else {
				reject("You are not connected to the internet.");
			}
		});
		
		Promise.all([f, onLine]).then(response => response[0].json()).then(res => resolve(res)).catch(reason => reject(reason));
	});
}

function getPropArray(input, prop) {
    const out = [];
    for (let i = 0; i < input.length; i++) {
        input[i];
        out.push(input[i][prop]);
    }
    return out;
}