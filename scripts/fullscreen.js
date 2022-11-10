function fullScreen() {
	let requestMethod = document.documentElement.requestFullscreen ||
						document.documentElement.webkitRequestFullscreen ||
						document.documentElement.webkitRequestFullScreen;
	if (requestMethod) {
		requestMethod.apply(document.documentElement)//.then(() => {document.getElementById('fullscreenIcon').innerHTML = 'fullscreen_exit';});
	}
}

function fullScreenExit() {
	let requestMethod = document.exitFullscreen ||
						document.webkitExitFullscreen ||
						document.webkitExitFullScreen;
	if (requestMethod) {
		requestMethod.apply(document)//.then(() => {document.getElementById('fullscreenIcon').innerHTML = 'fullscreen';});
	}
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		fullScreen();
	} else if (document.exitFullscreen || document.webkitExitFullscreen) {
		fullScreenExit();
	}
}