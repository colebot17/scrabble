var timeline = 0;
var interval;

onmessage = function(e) {
	switch (data.e.action) {
		case 'getTimeline':
			postMessage(timeline);
			break;
		case 'startTimeline':
			interval = setInterval(function(e) {
				timeline++;
			}, 1);
	}
}