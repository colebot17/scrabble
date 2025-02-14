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
	const url = '//' + location.host + location.pathname + '/php/' + filename;
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

function nlList(array, beforeVal = "", afterVal = beforeVal) {
	// this function takes an array of values and returns a natural-language list of its contents
	// it also supports wrapping the each value in a custom value, e.g. "<b>" and "</b>"

	if (array.length === 0) {
		return "";
	}
	if (array.length === 1) {
		return x(array[0]);
	}
	if (array.length === 2) {
		return x(array[0]) + " and " + x(array[1]);
	}
	if (array.length >= 3) {
		let str = x(array[0]);
		for (let i = 1; i < array.length; i++) {
			str += ", " + x(array[i]);
		}
		return str;
	}

	function x(val) {
		// this subfunction reduces complexity and allows for easier future manipulation of values
		return beforeVal + val + afterVal;
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

Number.prototype.isBetween = function(a, b, inclusive = false) {
	if (inclusive) {
		return (this >= a && this <= b) || (this <= a && this >= b);
	} else {
		return (this > a && this < b) || (this < a && this > b);
	}
}

// Fisher-Yates Shuffle (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
function shuffleArr(a) {
	let b=a.length,c;while(b!=0){c=Math.floor(Math.random()*b);b--;[a[b],a[c]]=[a[c],a[b]];}return a;
}

function temporaryTitle(title, callback) {
    document.title = title;
    document.addEventListener('visibilitychange', e => {
        if (document.hidden === false) {
            document.title = windowTitle;
            callback();
        };
    });
}

function urlB64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}