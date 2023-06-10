function addPlayerToNewGame(name = document.getElementById('createGamePlayerInput').value) {
	let newGamePlayerList = JSON.parse(document.getElementById('createGameModal').dataset.players);
	request('getIdFromName.php', {
		user: account.id,
		pwd: account.pwd,
		name: name
	}).then(res => {
		if (res.errorLevel > 0) { // if there is an error
			textModal("Error", res.message);
			return;
		}
		
		const input = document.getElementById('createGamePlayerInput');

		// make sure the player isn't already in the list
		for (let i in newGamePlayerList) {
			if (newGamePlayerList[i].id == res.value.id) {
				textModal("Error", "That player is already in the game.");
				input.value = ""; // clear the user's input
				return;
			}
		}
		newGamePlayerList.push({ // store the returned name and id in the list
			id: parseInt(res.value.id),
			name: res.value.name
		});
	
		// add the player list to the dataset of the player list element
		document.getElementById('createGameModal').dataset.players = JSON.stringify(newGamePlayerList);

		updateCreateGamePlayerList(); // update the player list
		input.value = ""; // clear the user's input
	});
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
			updateCreateGameFriendsList();
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
            <div class="friendListItem friendListFriend" id="createGamePlayer${i}" data-playerid="${player.id}">
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${player.name}
                    </span>
				</div>
				${players.id == account.id ? `` : `
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
}

function newGame(initialPlayers = []) {
	if (account.id) {
		$('#createGameModal').modalOpen(); // show the modal
        updateCreateGameFriendsList(account.friends);
 
		var newGamePlayerList = [{
			id: account.id,
			name: account.name
		}, ...initialPlayers]; // create the player list

		// add the player list to the dataset of the modal element
		document.getElementById('createGameModal').dataset.players = JSON.stringify(newGamePlayerList);

		// assign the enter key on the player input field to add the player
		const input = document.getElementById('createGamePlayerInput');
		input.removeEventListener('keypress', addPlayerKeyHandler);
		input.addEventListener('keypress', addPlayerKeyHandler);

		updateCreateGamePlayerList(); // update the player list
	} else {
		textModal("Error", "You must be signed in to create a new game.");
	}
}

function addPlayerKeyHandler(e) {
	// this function is called whenever a key is pressed while focus is on #createGamePlayerInput
	if (e.key === 'Enter') {
		if (!document.getElementById('createGamePlayerInput').value.trim()) {
			createGame();
		} else {
			addPlayerToNewGame();
		}
	}
}

function createGame(players = getPropArray(JSON.parse(document.getElementById('createGameModal').dataset.players), 'id')) {
	if (!account.id) {
		textModal("Error", "You must be signed in to create a new game.");
		return;
	}
	if (players.length < 2) {
		textModal("Error", "Games require at least two players.");
		return;
	}

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
					startGame(players);
				}
			}
		);
	} else {
		startGame(players);
	}
}

function startGame(players) {
	request('newGame.php', {
		user: account.id,
		pwd: account.pwd,
		players: JSON.stringify(players)
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