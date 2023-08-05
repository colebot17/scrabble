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
		fetch(url, {
			method: 'POST',
			body: data,
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		}).then(response => response.json()).then(res => resolve(res)).catch(reason => reject(reason));
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

String.prototype.toTitleCase = function() {
	return this.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

// copied from colebot.com themes.js
function autoContrast(color) {
	const [r, g, b] = getRGBA(color);

	var uicolors = [r / 255, g / 255, b / 255];
	var c = uicolors.map((col) => {
		if (col <= 0.03928) {
			return col / 12.92;
		}
		return Math.pow((col + 0.055) / 1.055, 2.4);
	});
	var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
	return (L > 0.179);
	// true if text should be black, false if text should be white
	// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
	// MUST be used with black (#000000) and white (#FFFFFF), or constant 0.179 needs to be recalculated somehow
}
function getRGBA(color) {
	const r = parseInt(color.slice(1, 3), 16);
	const g = parseInt(color.slice(3, 5), 16);
	const b = parseInt(color.slice(5, 7), 16);
	let a;
	if (color.length > 7) {
		a = parseInt(color.slice(7, 9), 16);
		return [r, g, b, a];
	} else {
		return [r, g, b];
	}
}
function makeHex(r, g, b, a) {
	let str = "#";
	str += r.toString(16);
	str += g.toString(16);
	str += b.toString(16);
	return str;
}

function resetMobileZoom() {
	updateMetaTag('viewport', 'maximum-scale', 1.0);
	setTimeout(() => {updateMetaTag('viewport', 'maximum-scale', 10.0)}, 1000);
}

function updateMetaTag(name, option, value) {
	const meta = document.querySelector('meta[name=' + name + ']');
	const rules = parseMetaString(meta.content);

	if (value === undefined) {
		delete rules[option];
	} else {
		rules[option] = value;
	}

	meta.content = createMetaString(rules);
}

function parseMetaString(string) {
	const rules = string.split(",");
	const object = {};
	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i].trim();
		const pair = rule.split('=');
		object[pair[0]] = pair[1];
	}
	return object;
}

function createMetaString(object) {
	const keys = Object.keys(object);
	const values = Object.values(object);
	let string = "";
	for (let i = 0; i < Math.min(keys.length, values.length); i++) {
		if (i !== 0) string += ", ";
 
		string += keys[i];
		string += "=";
		string += values[i];
	}
	return string;
}