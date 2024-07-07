function showTab(tab, updateHistory = true) {
	const sGrid = document.getElementById('scrabbleGrid');
	sGrid.dataset.tab = tab;

	// scroll to the top of the games list
	$('#activeGames .gamesListWrapper')[0].scrollTop = 0;

	if (tab === 'game' && canvas.initialized) {
		setCanvasSize();
	}

	if (tab === 'chat') {
		readChat();
	}

	if (tab === 'chat' || (tab === 'game' && sGrid.dataset.hidechatbox !== "false")) {
		chatScrollBottom();
		chatBoxResize();
	}

	if (tab === 'home') {
		stopChecking = true; // this is a destruct flag for checkForChanges
		removeHandlers();

		if (updateHistory) history.pushState({}, 'Home', '//' + location.host + location.pathname);
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

	if (mode === 'settings') {
		if (!account.tutorials?.settings) {
			startTutorial(settingsTutorial);
			setTutorial('settings', true);
		}
	}
}

function setGamesList(list) {
	var $gamesCell = $('#gamesCell');
	if (list === 'active') {
		$('#gamesCell .gamesListBox').addClass('hidden');
		$('#activeGames').removeClass('hidden');
	} else if (list === 'inactive') {
		$('#gamesCell .gamesListBox').addClass('hidden');
		$('#inactiveGames').removeClass('hidden');
	} else {
		console.error(`Failed to set games list: List ${list} not recognized.`);
	}
	$('#createGameModal').modalClose();
}

function setFriendsPage(page) {
    document.getElementById('friendsCell').dataset.page = page;

    if (page === 'addFriends') {
        const field = document.getElementById('addFriendField');
        field.value = "";
        field.focus();
        updateSendRequestPage();
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

    // do miscellaneous tasks
    if (page === 'history') {
        addToEscStack(() => {
            setCanvasPage('canvas');
        }, 'canvasPage_canvas');

		document.getElementById('historyContents').scrollTo(0, 0);

		setHistoryButtonMode('%auto');
    } else if (page === 'canvas') {
        removeFromEscStack('canvasPage_canvas');

		if (canvas.initialized) setCanvasSize();

		setHistoryButtonMode('%auto');
    }
}

function setNotificationPage(page = 'methodList') {
	// hide all the pages
	const pages = document.getElementsByClassName('notifPage');
	for (let page of pages) {
		page.classList.add('hidden');
	}

	// show the correct page
	document.getElementById('notifPage-' + page);
}