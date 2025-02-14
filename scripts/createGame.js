function addPlayerToNewGame(name = document.getElementById('createGamePlayerInput').value) {
	if (!name.trim()) {
		textModal("Error", "Enter a username to add a player to this game");
		return;
	}
	
	request('getIdFromName.php', {
		user: account.id,
		pwd: account.pwd,
		name: name
	}).then(res => {
		if (res.errorLevel > 0) { // if there is an error
			textModal("Error", res.message, {complete: () => {
				document.getElementById('createGamePlayerInput').select();
			}});
			return;
		}
		
		addAnyToNewGame(res.value.id, res.value.name);
	});
}

function addFriendToNewGame(id) {
	const friend = account.friends.find(a => a.id == id);
	addAnyToNewGame(friend.id, friend.name);
}

function addAnyToNewGame(id, name) {
	const input = document.getElementById('createGamePlayerInput');

	// make sure the player isn't already in the list
	const newGamePlayerList = JSON.parse(document.getElementById('createGameModal').dataset.players);
	for (let i in newGamePlayerList) {
		if (newGamePlayerList[i].id == id) {
			textModal("Error", "That player is already in the game.");
			input.value = ""; // clear the user's input
			setHighlightedCreateGameButton(false);
			return;
		}
	}
	newGamePlayerList.push({ // store the returned name and id in the list
		id: parseInt(id),
		name: name
	});

	// add the player list to the dataset of the player list element
	document.getElementById('createGameModal').dataset.players = JSON.stringify(newGamePlayerList);

	updateCreateGamePlayerList();  // update the player list and friend list
	updateCreateGameFriendsList(); //
	input.value = ""; // clear the user's input
	setHighlightedCreateGameButton(false);
}

function removePlayerFromNewGame(id) {
	// prevent removal of current player
	if (id === account.id) {
		textModal("Error", "You cannot remove yourself from a new game.");
		return;
	}

	let newGamePlayerList = JSON.parse(document.getElementById('createGameModal').dataset.players);
	for (let i in newGamePlayerList) {
		if (newGamePlayerList[i].id === id) {
			newGamePlayerList.splice(i, 1);
			document.getElementById('createGameModal').dataset.players = JSON.stringify(newGamePlayerList);
			updateCreateGamePlayerList();
			updateCreateGameFriendsList(account.friends);
			return;
		}
	}

	textModal("Unexpected Error", "For an unknown reason, the player cannot be removed from the game.");
}

function updateCreateGamePlayerList(players = JSON.parse(document.getElementById('createGameModal').dataset.players)) {
	const list = document.getElementById('createGamePlayerList');
    list.innerHTML = "";

    let listContents = ``;

    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        let listItem = `
            <div class="friendListItem requestListFriend" id="createGamePlayer${i}" data-playerid="${player.id}">
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${player.name}${player.id == account.id ? `<span class="textColorLight"> (You)</span>` : ``}
                    </span>
				</div>
				${player.id == account.id ? `` : `
					<div class="friendControls">
						<button class="iconButton" title="Remove Player" onclick="removePlayerFromNewGame(${player.id})">
							<span class="material-symbols-rounded">
								remove
							</span>
						</button>
					</div>
				`}
            </div>
        `;
        listContents += listItem;
    }

	list.style.display = (players.length === 0 ? "none" : "");

    list.innerHTML = listContents;

	// enable/disable create game button
	const button = document.getElementById('createGameModalButton');
	const disableButton = players.length < 2;
	button.disabled = disableButton;
	button.title = disableButton ? "Add players to create a game" : "";
}

function newGame(initialPlayers = []) {
	if (account.id) {
		$('#createGameModal').modalOpen(); // show the modal
 
		var newGamePlayerList = [{
			id: account.id,
			name: account.name
		}, ...initialPlayers]; // create the player list

		// add the player list to the dataset of the modal element
		document.getElementById('createGameModal').dataset.players = JSON.stringify(newGamePlayerList);

		// set the language to the default
		document.getElementById((account.defaultLang || 'english') + 'LangOption').checked = true;

		// assign the enter key on the player input field to add the player
		const input = document.getElementById('createGamePlayerInput');
		input.removeEventListener('keyup', addPlayerKeyupHandler);
		input.addEventListener('keyup', addPlayerKeyupHandler);

		setAddPlayerPanelPage('friends'); // show the default page

		updateCreateGamePlayerList();                 // update the player list and friends list
		updateCreateGameFriendsList(account.friends); //
	} else {
		textModal("Error", "You must be signed in to create a new game.");
	}
}

function addPlayerKeyupHandler(e) {
	// this function is called whenever a key is released while focus is on #createGamePlayerInput

	let inputValue = document.getElementById('createGamePlayerInput').value.trim();

	if (e.key === 'Enter') {
		if (!inputValue) {
			createGame();
		} else {
			addPlayerToNewGame();
			inputValue = "";
		}
	}

	setHighlightedCreateGameButton(inputValue);
}

function setHighlightedCreateGameButton(alt = false) {
	if (alt) {
		document.getElementById('createGameModalButton').classList.remove('highlight');
		document.getElementById('createGamePlayerAddButton').classList.add('highlight');
	} else {
		document.getElementById('createGameModalButton').classList.add('highlight');
		document.getElementById('createGamePlayerAddButton').classList.remove('highlight');
	}
}

function createGame(players = getPropArray(JSON.parse(document.getElementById('createGameModal').dataset.players), 'id'), lang = document.querySelector('input[name=lang]:checked').value) {
	if (!account.id) {
		textModal("Error", "You must be signed in to create a new game.");
		return;
	}
	if (players.length < 2) {
		textModal("Error", "Games require at least two players.");
		return;
	}

	if (!lang) lang = account.defaultLang || 'english';

	// confirm before starting if a game with the same players exists already
	let confirm = false;
	const gamesArr = Object.values(account.games);
	const playersDup = JSON.parse(JSON.stringify(players));
	for (let i = 0; i < gamesArr.length; i++) {
		const JOIN_STR = " ";
		const identical = getPropArray(gamesArr[i].players, 'id').sort().join(JOIN_STR) === playersDup.sort().join(JOIN_STR);
		if (identical && !gamesArr[i].inactive) {
			confirm = true;
			break;
		}
	}

	if (confirm) {
		textModal(
			"New Game",
			"You are already in a game with this group of players. Are you sure you want to start another one?",
			{
				cancelable: true,
				complete: () => {
					startGame(players, lang);
				}
			}
		);
	} else {
		startGame(players, lang);
	}
}

function startGame(players, lang) {
	request('newGame.php', {
		user: account.id,
		pwd: account.pwd,
		players: JSON.stringify(players),
		lang: lang
	}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}
		$('#createGameModal').modalClose(); // hide the modal
		loadGame(res.data);
		loadGamesList();
	});
}