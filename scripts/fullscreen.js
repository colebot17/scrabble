function fullScreen() {
	document.documentElement.requestFullscreen();
}

function fullScreenExit() {
	document.exitFullscreen();
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		fullScreen();
	} else if (document.exitFullscreen) {
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