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