function fullScreen() {
	let requestMethod = document.documentElement.requestFullscreen ||
						document.documentElement.webkitRequestFullscreen ||
						document.documentElement.webkitRequestFullScreen;
	console.log(requestMethod);
	if (requestMethod) {
		requestMethod.apply(document.documentElement)//.then(() => {document.getElementById('fullscreenIcon').innerHTML = 'fullscreen_exit';});
	}
}

function fullScreenExit() {
	let requestMethod = document.exitFullscreen ||
						document.webkitExitFullscreen ||
						document.webkitExitFullScreen;
	console.log(requestMethod);
	if (requestMethod) {
		requestMethod.apply(document)//.then(() => {document.getElementById('fullscreenIcon').innerHTML = 'fullscreen';});
	}
}

function toggleFullScreen() {
	console.log(document.fullScreenElement);
	if (!document.fullscreenElement) {
		fullScreen();
	} else if (document.exitFullscreen || document.webkitExitFullscreen) {
		fullScreenExit();
	}
}

function enableFullScreen() {
	if (document.documentElement.requestFullscreen && document.exitFullscreen) {
		alert('full screen enabled');
	}
}