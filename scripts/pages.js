function showTab(tab) {
	document.getElementById('scrabbleGrid').dataset.tab = tab;

	// scroll to the top of the games list
	$('#activeGames .gamesListWrapper')[0].scrollTop = 0;

	if (tab === 'chat') {
		readChat();
	}

	if (tab === 'chat' || tab === 'game') {
		chatScrollBottom();
		chatBoxResize();
	}

	if (tab === 'home') {
		stopChecking = true;
		removeHandlers();
	}

	if (tab === 'friends' || tab === 'account') {
		loadFriendsList();
	}
}

function setSignInMode(mode) {
	const backButtonKey = {
		settings: "signOut",
		changePassword: "settings",
		changeUsername: "settings",
		accountSwitcher: "settings",
		signIn: "accountSwitcher"
	};

	let $signInCell = $('#signInCell');
	if (!mode) { // go back if no argument is supplied
		let currentMode = $signInCell.attr('data-mode');
		mode = backButtonKey[currentMode];
	}

	$signInCell.off();
	$('#signInCell .accountForm').addClass('hidden');
	const action = $('#signInCell #' + mode + 'Form').removeClass('hidden').attr('data-action');
	$signInCell.on('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (action) window[action]();
		}
	});
	
	removeFromEscStack('signInMode_' + mode);

	if (backButtonKey[mode]) {
		addToEscStack(() => {
			setSignInMode(backButtonKey[mode]);
		}, 'signInMode_' + backButtonKey[mode]);
	}
}

function setAddPlayerPanelPage(page) {
	document.getElementById('addPlayerPanel').dataset.page = page;

	if (page === 'others') {
		document.getElementById('createGamePlayerInput').focus();
	}
}

function setCanvasPage(page = 'canvas') {
    // hide all the canvas pages
    const canvasPages = document.getElementsByClassName('canvasPage');
    Array.from(canvasPages).forEach(el => {
        el.classList.add('hidden');
    });

    // show the specified page
    document.getElementById(page + 'CanvasPage').classList.remove('hidden');

    // set the escape stack if necessary
    if (page === 'history') {
        addToEscStack(() => {
            setCanvasPage('canvas');
        }, 'canvasPage_canvas');
    } else if (page === 'canvas') {
        removeFromEscStack('canvasPage_canvas');
    }
}