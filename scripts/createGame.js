function addPlayerToNewGame(name = $('#createGamePlayerInput').val()) {
	var newGamePlayerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players);
	$.ajax(
		location + '/php/getIdFromName.php',
		{
			data: {
				user: account.id,
				pwd: account.pwd,
				name: name
			},
			method: "POST",
			success: function(data) {
				jsonData = JSON.parse(data);
				if (jsonData.errorLevel > 0) { // if there is an error
					textModal("Error", jsonData.message);
				} else { // if everything went well
					// make sure the player isn't already in the list
					for (let i in newGamePlayerList) {
						if (newGamePlayerList[i].id == jsonData.value.id) {
							textModal("Error", "That player is already in the game.");
							$('#createGamePlayerInput').val(""); // clear the user's input
							return;
						}
					}
					newGamePlayerList.push({ // store the returned name and id in the list
						id: parseInt(jsonData.value.id),
						name: jsonData.value.name
					});
				
					// add the player list to the dataset of the player list element
					document.getElementById('createGamePlayerList').dataset.players = JSON.stringify(newGamePlayerList);

					updateNewGamePlayerList(); // update the player list
					$('#createGamePlayerInput').val(""); // clear the user's input
				}
			},
			error: function() {
				console.error("Could not request the user's id from the server.");
			}
		}
	);
}

function removePlayerFromNewGame(id) {
	// prevent removal of current player
	if (id === account.id) {
		textModal("Error", "You cannot remove yourself from a new game.");
		return;
	}

	let newGamePlayerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players);
	for (let i in newGamePlayerList) {
		if (newGamePlayerList[i].id === id) {
			newGamePlayerList.splice(i, 1);
			document.getElementById('createGamePlayerList').dataset.players = JSON.stringify(newGamePlayerList);
			updateNewGamePlayerList();
			return;
		}
	}

	textModal("Unexpected Error", "For an unknown reason, that player cannot be removed from the game.");
}

function updateNewGamePlayerList() {
	const newGamePlayerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players);

	const playerList = $('#createGamePlayerList').empty();

	let playerListContent = ``;
	for (let i in newGamePlayerList) {
		playerListContent += `
			<div class="createGamePlayer">
				${newGamePlayerList[i].name}
				${newGamePlayerList[i].id === account.id ? `` : `
					<button class="iconButton" onclick="removePlayerFromNewGame(${newGamePlayerList[i].id})">
						<span class="material-symbols-rounded smallIcon">
							remove
						</span>
					</button>
				`}
			</div>
		`;
	}

	playerList.html(playerListContent);
}

function newGame(initialPlayers = []) {
	if (account.id) {
		$('#createGameModal').modalOpen(); // show the modal
        updateCreateGameFriendsList(account.friends);

        /* 
		var newGamePlayerList = [{
			id: account.id,
			name: account.name
		}, ...initialPlayers]; // create the player list

		// add the player list to the dataset of the player list element
		document.getElementById('createGamePlayerList').dataset.players = JSON.stringify(newGamePlayerList);

		// assign the enter key on the player input field to add the player
		$('#createGamePlayerInput').on('keypress', function(e) {
			if (e.key === 'Enter') {
				if (!$(this).val().trim()) {
					createGame();
				} else {
					addPlayerToNewGame();
				}
			}
		});

		updateNewGamePlayerList(); // update the player list */
	} else {
		textModal("Error", "You must be signed in to create a new game.");
	}
}

function createGame(players = getPropArray(JSON.parse(document.getElementById('createGamePlayerList').dataset.players), 'id')) {
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

function updateCreateGamePlayerList(players = ) {
	
}