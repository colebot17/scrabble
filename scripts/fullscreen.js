function fullScreen() {
	let requestMethod = document.documentElement.requestFullscreen ||
						document.documentElement.webkitRequestFullscreen ||
						document.documentElement.webkitRequestFullScreen;
	console.log(requestMethod);
	if (requestMethod) {
		requestMethod.apply(document.documentElement)
	}
}

function fullScreenExit() {
	let requestMethod = document.exitFullscreen ||
						document.webkitExitFullscreen ||
						document.webkitExitFullScreen;
	console.log(requestMethod);
	if (requestMethod) {
		requestMethod.apply(document)
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
	if (document.fullscreenEnabled) {
		// show the fullscreen button
		document.getElementById('fullscreenButton').classList.remove('hidden');

		// change icon when entering/exiting fullscreen
		document.addEventListener('fullscreenchange', () => {
			let iconName = (document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen');
			document.getElementById('fullscreenIcon').innerHTML = iconName;
		});
	}
}

enableFullScreen();