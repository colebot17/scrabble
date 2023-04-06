const boardModifiers = [
	[4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4],
	[0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
	[0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
	[1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
	[0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
	[0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
	[0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
	[4, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 4],
	[0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
	[0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
	[0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
	[1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
	[0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
	[0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
	[4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4]
];

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const letterScores = {"A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 5, "L": 1, "M": 3, "N": 1, "O": 1, "P": 3, "Q": 10, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 4, "X": 8, "Y": 4, "Z": 10};
const scoreMultipliers = [
	{letter: 1, word: 1},
	{letter: 2, word: 1},
	{letter: 3, word: 1},
	{letter: 1, word: 2},
	{letter: 1, word: 3},
	{letter: 1, word: 1},
];

var game;

var dragged;

$(':root').css('--height', `${window.innerHeight}px`);
window.addEventListener('resize', () => {
	$(':root').css('--height', `${window.innerHeight}px`);
});

function loadGamesList(done) {
	if (account.id) {
		// spin the reload button until list is loaded
		const button = document.getElementById('gamesListRefreshButton');
		button.classList.remove('spin');
		let int;
		let complete = false;
		setTimeout(() => {
			button.classList.add('spin');
			int = setInterval(() => {
				if (complete) {
					button.classList.remove('spin');
					clearInterval(int);
				}
			}, 370);
		}, 10);
		$.ajax(
			location + '/php/loadPlayerGames.php',
			{
				data: {
					user: account.id,
					pwd: account.pwd
				},
				method: "POST",
				success: function(data) {
					jsonData = JSON.parse(data);
					if (jsonData.errorLevel > 0) { // error
						textModal("Error", jsonData.message);
					} else { // success
						// stop the reload button spinning
						complete = true;

						// blink the games list
						var $gamesList = $('#activeGamesList');
						$gamesList.hide().fadeIn(370);

						// load the new content
						account.games = jsonData.data;
						updateGamesList();

						// // done (for pull to refresh)
						// if (done) {
						// 	done();
						// }
					}
				},
				error: function() {
					console.error("Could not fetch updated games list.");
				}
			}
		);
	}
}

function updateGamesList() {
	if (account.games) {
		if (localStorage.gameListDisplayMode) {
			setDisplayMode(localStorage.gameListDisplayMode);
		}

		var noActiveGames = true;
		var noInactiveGames = true;

		var $activeGamesList = $('#activeGamesList');
		var $inactiveGamesList = $('#inactiveGamesList');
		$('.gamesList').empty(); // empty both game lists

		var $activeGamesListMessage = $('#activeGamesListMessage');
		var $inactiveGamesListMessage = $('#inactiveGamesListMessage');

		// convert games object into two arrays, one for active games, and another for inactive games
		let activeGames = [];
		let inactiveGames = [];

		for (let i in account.games) {
			let currentGame = account.games[i];
			currentGame.id = parseInt(i);

			// convert the dates to date objects
			currentGame.lastMove = new Date(currentGame.lastMove);
			if (currentGame.endDate) {
				currentGame.endDate = new Date(currentGame.endDate);
			}

			// push to the appropriate array
			if (currentGame.inactive) {
				inactiveGames.push(currentGame);
			} else {
				activeGames.push(currentGame);
			}
		}


		// sort the active games array by the last move timestamp 
		activeGames.sort(function(a, b) {
			if (a.lastMove > b.lastMove) { // a comes before b (in the display order)
				return -1;
			}
			if (a.lastMove < b.lastMove) { // a comes after b
				return 1;
			}
			// a must be equal to b
			return 0;
		});

		// sort the active games array by whether it is the current user's turn
		activeGames.sort(function(a, b) {
			let aTurn = false;
			let bTurn = false;
			if (!a.inactive) {
				aTurn = parseInt(a.players[parseInt(a.turn) % a.players.length].id) === account.id;
			}
			if (!b.inactive) {
				bTurn = parseInt(b.players[parseInt(b.turn) % b.players.length].id) === account.id;
			}
			if (aTurn && !bTurn) {
				return -1;
			}
			if (!aTurn && bTurn) {
				return 1;
			}
			return 0;
		});

		// sort the inactive games array by the end date timestamp
		inactiveGames.sort(function(a, b) {
			if (a.endDate > b.endDate || (a.endDate && !b.endDate)) { // a comes before b (in the display order)
				return -1;
			}
			if (a.endDate < b.endDate || (!a.endDate && b.endDate)) { // a comes after b
				return 1;
			}
			// a must be equal to b
			return 0;
		});

		// copy and combine the two arrays
		let gamesArray = activeGames.concat(inactiveGames);

		// for each game in the account
		for (var i in gamesArray) {
			// calculate the winning player(s)
			let winners = [];
			for (let j in gamesArray[i].players) {
				if (gamesArray[i].players[j].points > 0) {
					if (winners.length > 0) {
						if (gamesArray[i].players[j].points > gamesArray[i].players[winners[0]].points) {
							winners = [j];
						} else if (gamesArray[i].players[j].points === gamesArray[i].players[winners[0]].points) {
							winners.push(j);
						}
					} else {
						winners = [j];
					}
				}
			}

			if (!gamesArray[i].inactive) { // if the game is active
				noActiveGames = false;
				let turnIndex = parseInt(gamesArray[i].turn) % gamesArray[i].players.length;
				let turnUser = parseInt(gamesArray[i].players[turnIndex].id);
				let playerListHTML = ``;
				for (var j in gamesArray[i].players) { // add each player to the list of players in the card
					let endGameVoted = gamesArray[i].players[j].endGameRequest === 'true';
					playerListHTML += /* html */ `
						<div class='listGamePlayerListPlayer'>
							${(winners.includes(j) ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>` : ``)}
							<b>
								${(j == turnIndex ? `<u>` : ``)}
								${gamesArray[i].players[j].name}
								${(j == turnIndex ? `</u>` : ``)}
							</b>
							: 
							${gamesArray[i].players[j].points}
							${(endGameVoted ? `<span class='material-symbols-rounded winnerIcon' title='Voted to end the game'>highlight_off</span>`: ``)}
						</div>
					`;
				}
				playerListHTML = playerListHTML.substring(0, playerListHTML.length - 2); // remove the extra comma at the end

				let playerListSummaryHTML;
				if (gamesArray[i].players.length === 2) {
					let otherPlayer = 0;
					if (gamesArray[i].players[0].id == account.id) otherPlayer = 1;
					playerListSummaryHTML = /* html */ `You, <b>${gamesArray[i].players[otherPlayer].name}</b>`
				} else {
					playerListSummaryHTML = /* html */ `You, +${gamesArray[i].players.length - 1}`;
				}

				let turnSummaryHTML;
				if (gamesArray[i].players[turnIndex].id == account.id) {
					turnSummaryHTML = `Your turn`;
				} else {
					turnSummaryHTML = /* html */ `<b>${gamesArray[i].players[turnIndex].name}</b>'s turn`;
				}

				// add the game card to the list
				$activeGamesList.append( /* html */`
					<div class="listGame" id="listGame${gamesArray[i].id}">
						<div class="listGameTitleBox">
							<span class="listGameName" onclick="renameGame(${gamesArray[i].id}, 'list')">
								${gamesArray[i].name || `#${gamesArray[i].id}`}
							</span>
							${gamesArray[i].name ? /* html */ `
								<div class="gameIdLine">
									#${gamesArray[i].id}
								</div>
							` : ``}
						</div>
						<div class="listGamePlayerList">
							${playerListHTML}
						</div>
						<div class="listGameInfoSummary">
							<div class="playerListSummary">
								${playerListSummaryHTML}
							</div>
							<div class="turnSummary">
								${turnSummaryHTML}
							</div>
						</div>
						<button class="openGameButton${(turnUser == account.id ? " highlight" : "")}" onclick="loadGame(${gamesArray[i].id}, true)" data-gameid="${gamesArray[i].id}">
							${(turnUser == account.id ? "Play" : "View")}
						</button>
					</div>
				`);
			} else { // if the game is inactive
				noInactiveGames = false;
				let playerListHTML = ``;
				for (var j in gamesArray[i].players) { // add each player to the list of players in the card
					playerListHTML += /* html */ `
						<div class="listGamePlayerListPlayer">
							${(winners.includes(j) ? "<span class='material-symbols-rounded winnerIcon'>military_tech</span>" : "")}
							<b>
								${gamesArray[i].players[j].name}
							</b>
							: ${gamesArray[i].players[j].points}
						</div>
					`;
				}
				playerListHTML = playerListHTML.substring(0, playerListHTML.length - 2); // remove the extra comma at the end

				let playerListSummaryHTML;
				if (gamesArray[i].players.length === 2) {
					let otherPlayer = 0;
					if (gamesArray[i].players[0].id == account.id) otherPlayer = 1;
					playerListSummaryHTML = /* html */ `You, <b>${gamesArray[i].players[otherPlayer].name}</b>`
				} else {
					playerListSummaryHTML = /* html */ `You, +${gamesArray[i].players.length - 1}`;
				}

				let winnerString = "";
				if (winners.length === 1) {
					winnerString = /* html */ `<b>${gamesArray[i].players[winners[0]].name}</b>`;
				} else if (winners.length === 2) {
					winnerString = /* html */ `<b>${gamesArray[i].players[winners[0]].name}</b> and <b>${gamesArray[i].players[winners[1]].name}</b>`;
				} else if (winners.length >= 3) {
					for (let j = 0; j < winners.length; j++) {
						if (j < winners.length - 1) {
							winnerString += /* html */ `<b>${gamesArray[i].players[winners[j]].name}</b>, `;
						} else {
							winnerString += /* html */ `and <b>${gamesArray[i].players[winners[j]].name}</b>`;
						}
					}
				}
				let winnerHTML = /* html */ `${winnerString} won`;

				// add the game card to the list
				$inactiveGamesList.append(/* html */ `
					<div class="listGame" id="listGame${gamesArray[i].id}">
						<div class="listGameTitleBox">
							<div class="gameTitleLine">
								<span class="material-symbols-rounded smallIcon" style='padding: 5px'>
									inventory_2
								</span>
								<span class="listGameName" onclick="renameGame(${gamesArray[i].id}, 'list')">
									${gamesArray[i].name || `#${gamesArray[i].id}`}
								</span>
							</div>
							${gamesArray[i].name ? /* html */ `
								<div class="gameIdLine">
									#${gamesArray[i].id}
								</div>
							` : ``}
						</div>
						<div class="listGamePlayerList">
							${playerListHTML}
						</div>
						<div class="listGameInfoSummary">
							<div class="playerListSummary">
								${playerListSummaryHTML}
							</div>
							<div class="turnSummary">
								${winnerHTML}
							</div>
						</div>
						<button class="openGameButton" onclick="loadGame(${gamesArray[i].id}, true)" data-gameid="${gamesArray[i].id}">
							View
						</button>
					</div>
				`);
			}
		}

		// add the new game card to the end of the active games tab
		$activeGamesList.append(/* html */ `
			<button class="newGameCard" onclick="newGame();">
				<span class="material-symbols-rounded largeIcon">
					add
				</span>
				<span class="large">
					New Game
				</span>
				<span></span>
			</button>
		`);

		// set the message for the active games list
		if (!noActiveGames) {
			$activeGamesListMessage.empty();
		} else {
			$activeGamesListMessage.html(`You have no active games. Create a new one below.`);
		}

		// set the message for the inactive games list
		if (!noInactiveGames) {
			$inactiveGamesListMessage.empty();
		} else {
			$inactiveGamesListMessage.html(`You have no inactive games. Once any game ends, it will be archived here.`);
		}

		// // initiate the pull to refresh
		// PullToRefresh.init({
		// 	mainElement: "#activeGames .gamesListWrapper .gamesList",
		// 	onRefresh(done) {
		// 		loadGamesList(done);
		// 	}
		// });
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

function setDisplayMode(mode) {
	const gamesCell = document.getElementById('gamesCell');
	const buttons = document.getElementsByClassName('displayModeButton');
	
	gamesCell.dataset.displaymode = mode;
	
	for (let i = 0; i < buttons.length; i++) {
		if (buttons[i].id === (mode + "ViewButton")) {
			buttons[i].setAttribute("aria-pressed", "true");
		} else {
			buttons[i].setAttribute("aria-pressed", "false");
		}
	}

	// store in local storage
	if (mode !== "card") {
		localStorage.gameListDisplayMode = mode;
	} else {
		localStorage.removeItem('gameListDisplayMode');
	}
}

function renameGame(gameId, loc) {
	// get the element(s) to be updated upon completion
	const $nameFields = $('#listGame' + gameId + ' .listGameName, #gameControlsCell .gameName');
	const $titleBoxes = $('#listGame' + gameId + ' .listGameTitleBox, #gameControlsCell .gameTitleBox');
	const $idLines = $('#listGame' + gameId + ' .gameIdLine, #gameControlsCell .gameIdLine');

	// inline name editing!
	let nameField;
	if (loc === "list") {
		nameField = document.querySelector("#listGame" + gameId + " .listGameName");
	} else if (loc === "game") {
		nameField = document.querySelector("#gameControlsCell .gameName");
	}

	// define the input field to temporarily replace the name field
	const inputField = document.createElement("input");
	inputField.classList.add('listGameNameInput');

	// add the input field
	nameField.classList.add('hidden');
	nameField.after(inputField);
	inputField.select();
	
	// add the listeners
	inputField.addEventListener('keydown', function(e) {
		if (e.key === "Enter") {
			// rename the game
			const name = inputField.value;
			inputField.disabled = true;
			inputField.style.cursor = "progress";
			$.ajax(
				location + '/php/renameGame.php',
				{
					data: {
						user: account.id,
						pwd: account.pwd,
						game: gameId,
						name
					},
					method: "POST",
					success: function(data) {
						let jsonData = JSON.parse(data);
						if (jsonData.errorLevel) {
							textModal("Error", jsonData.message);
						} else {
							$nameFields.text(jsonData.data || '#' + gameId);
							$idLines.remove();
							if (jsonData.data) { // if the game has a name
								// show the id line
								$titleBoxes.append(`
									<div class="gameIdLine">
										#${gameId}
									</div>
								`);
							}
							if (game?.id === gameId) { // if the game is currently loaded
								game.name = jsonData.data || ""; // set the name in game obj
							}
						}
						inputField.remove();
						nameField.classList.remove('hidden');
					},
					error: function() {
						console.error("Could not rename game.");
					}
				}
			);
		} else if (e.key === "Escape") {
			inputField.remove();
			nameField.classList.remove('hidden');
		}
	});

	inputField.addEventListener('blur', function(e) {
		inputField.remove();
		nameField.classList.remove('hidden');
	});
}

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

function newGame() {
	if (account.id) {
		$('#createGameModal').modalOpen(); // show the modal

		var newGamePlayerList = [{
			id: account.id,
			name: account.name
		}]; // create the player list

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

		updateNewGamePlayerList(); // update the player list
	} else {
		textModal("Error", "You must be signed in to create a new game.");
	}
}

function createGame(playerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players)) {
	var players = [];
	for (let i in playerList) {
		players.push(playerList[i].id);
	}

	if (!account.id) {
		textModal("Error", "You must be signed in to create a new game.");
		return;
	}
	if (players.length < 2) {
		textModal("Error", "Games require at least two players.");
		return;
	}

	$.ajax(
		location + '/php/newGame.php',
		{
			data: {user: account.id, pwd: account.pwd, players: JSON.stringify(players)},
			method: "POST",
			success: function(data) {
				// var tab = window.open('about:blank', '_blank');
				// tab.document.write(data);
				if (data !== 0) {
					$('#createGameModal').modalClose(); // hide the modal
					loadGame(data);
					loadGamesList();
				} else {
					textModal("Error", "You don't have permission to create a new game!");
				}
			},
			error: function() {
				console.error("Game could not be created.");
			}
		}
	);
}

function loadGame(id = prompt("Enter the id of the game you want to load:"), expand = false) {
	if (id) {
		if (expand) { // expanding animation of the play button
			let expandEl = $('#listGame' + id + ' .openGameButton');

			// position the element
			const offset = expandEl.offset();
			const top = offset.top;
			const left = offset.left + (expandEl.width() / 2) - 30;

			let clone = expandEl.clone().attr('onclick','').css({
				'position': 'fixed',
				'top': top + 'px',
				'left': left + 'px',
				'pointerEvents': 'none'
			}).appendTo('#scrabbleGrid');

			// run the expansion animation
			clone.addClass('expandAnimation');
			setTimeout(function() {clone.remove()}, 740);
		}
		return $.ajax(
			location + '/php/loadGame.php',
			{
				data: {user: account.id, pwd: account.pwd, game: id},
				method: "POST",
				success: function(data) {
					// var tab = window.open('about:blank', '_blank');
					// tab.document.write(data);
					if (data !== "0") {
						game = JSON.parse(data);
						for (var i = 0; i < game.players.length; i++) {
							if (game.players[i].id == account.id) {
								game.currentPlayerIndex = i;
								break;
							}
						}
						showTab('game'); // show the game tab
						gameInit(); // initialize the game
					} else {
						textModal("Error", "You don't have permission to load that game!");
					}
				},
				error: function() {
					console.error("Game could not be loaded.");
				}
			}
		);
	}
}

function reloadGame() {
	if (game.id) {
		// spin the reload button until game is loaded
		const button = document.getElementById('reloadGameButton');
		button.classList.remove('spin');
		let int;
		let complete = false;
		setTimeout(() => {
			button.classList.add('spin');
			int = setInterval(() => {
				if (complete) {
					button.classList.remove('spin');
					clearInterval(int);
				}
			}, 370);
		}, 10);

		// set complete to true once the game has loaded
		loadGame(game.id).then(() => complete = true);
	}
}

// remove the game
function endGame() {
	// make sure user is signed in and in a game and whatever
	if (!account.id) {
		textModal("Error", "You must be signed in to end a game.");
		return;
	}
	if (!game) {
		textModal("Error", "You must be playing a game to end it.");
		return;
	}

	let voted = game.players[game.currentPlayerIndex].endGameRequest === 'true';
	
	let endGameCount = 0;
	for (let i in game.players) {
		if (game.players[i].endGameRequest === 'true') {
			endGameCount++;
		}
	}
	const votesLeft = game.players.length - endGameCount;

	let confirmMsg;
	if (voted) {
		confirmMsg = "Do you really want to revoke your vote to end the game?";
	} else {
		confirmMsg = "Do you really want to cast your vote to end the game? " + (
			votesLeft <= 1
			? "You are the final player to do so, so the game will end."
			: "If you do, " + (votesLeft - 1) + " player" + ((votesLeft - 1) === 1 ? "" : "s") + " will still have to vote before the game ends."
		);
	}

	// get user confirmation for delete
	textModal("End Game", confirmMsg, {
		cancelable: true,
		complete: () => {
			// send the request
			$.ajax(
				location + (voted ? '/php/unEndGame.php' : '/php/endGame.php'),
				{
					data: {
						user: account.id,
						pwd: account.pwd,
						game: game.id
					},
					method: "POST",
					success: function(data) {
						// var tab = window.open("about:blank", "_blank");
						// tab.document.write(data);
						jsonData = JSON.parse(data);
						textModal("End Game", jsonData.message);
						if (jsonData.errorLevel === 0) {
							if (voted) {
								loadGame(game.id);
							} else {
								loadGamesList();
								showTab('account');
							}
						}
					},
					error: function() {
						console.error("Could not end the game.");
					}
				}
			);
		}
	});	
}

// initialize the game in the global variable 'game'
function gameInit() {
	canvasInit(); // initialize the canvas

	// get the current player
	let currentPlayerIndex;
	for (let i = game.players.length - 1; i >= 0; i--) {
		if (game.players[i].id == account.id) {
			currentPlayerIndex = i;
			break;
		}
	}

	// this is the current player's bank
	const bank = game.players[currentPlayerIndex].letterBank;

	// create an object of the letter bank for the canvas
	canvas.bank = [];
	for (let i in bank) {
		canvas.bank.push({
			letter: bank[i],
			hidden: false,
			position: {
				x: undefined,
				y: undefined
			},
			bankIndex: parseInt(i),
			extraGapAfter: 0
		});
	}

	// this is the bank order
	const bankOrder = game.players[currentPlayerIndex].bankOrder;

	// initialize the bank order
	if (!bankOrder) {
		canvas.bankOrder = [];
		for (let i in bank) {
			canvas.bankOrder.push(parseInt(i));
		}
	} else {
		canvas.bankOrder = bankOrder;
	}

	// clear event listeners from canvas
	let $canvas = $(canvas.c);
	$canvas.off();

	// go ahead and define the things we will disable when it isn't the user's turn
	const ootDisable = '#makeMoveButton, #skipTurnButton';

	// make sure everything is enabled (we will disable them again if we need to)
	$(ootDisable).css('cursor', '').prop('disabled', false).attr('title', '').off('mousedown touchstart');

	// determine whether it is the current user's turn
	const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

	$canvas.on('dblclick', handleCanvasDblClick);

	$canvas.on("mousedown", handleCanvasMouseDown);
	$canvas.on("touchstart", handleCanvasMouseDown);

	$canvas.on("mousemove", handleCanvasMouseMove);
	$canvas.on("touchmove", handleCanvasMouseMove);

	document.addEventListener('mouseup', handleDocumentMouseUp);
	document.addEventListener('touchend', handleDocumentMouseUp);

	if (!userTurn) {
		$ootDisable = $(ootDisable);

		$ootDisable.css('cursor', 'not-allowed').prop('disabled', true).attr('title', 'It isn\'t your turn!'); // show not-allowed cursor and disable buttons

		$ootDisable.on('mousedown touchstart', function(e) {
			e.preventDefault();
			textModal((game.inactive ? "Inactive Game" : "Not your turn!"), (game.inactive ? "This game is inactive, meaning it can no longer be played. You can still look at it all you want, though." : "It's someone else's turn right now. Wait for your turn to make a move.")); // show an alert when the user tries to interact with the canvas or letter bank
		});

		const banner = document.getElementById('gameBanner');
		banner.innerHTML = (game.inactive ? "This game has ended and is now archived." : "It isn't your turn. Any letters you place will not be saved.");
		banner.classList.remove('hidden');
	} else {
		const banner = document.getElementById('gameBanner');
		banner.innerHTML = "";
		banner.classList.add('hidden');
	}

	// show the game info
	let gameInfoBox = $('#gameControlsCell .gameInfoBox');
	
	// start with the game name
	let gameInfo = /* html */ `
		<div class="gameTitleBox">
			<div class="gameTitleLine">
				<button class="iconButton" onclick="getInfo()">
					<span class="material-symbols-rounded smallIcon">
						info
					</span>
				</button>
				<span class="gameName">
					${game.name || `#${game.id}`}
				</span>
				<button class="iconButton" onclick="renameGame(${game.id}, 'game')">
					<span class="material-symbols-rounded smallIcon">
						drive_file_rename_outline
					</span>
				</button>
			</div>
			${game.name ? /* html */ `
				<div class="gameIdLine">
					#${game.id}
				</div>
			` : ``}
		</div>
	`;

	// calculate the winning player
	let turnIndex = parseInt(game.turn) % game.players.length;
	let winningPoints = 1;
	for (let i in game.players) {
		winningPoints = Math.max(winningPoints, game.players[i].points);
	}

	// add each player to the player list
	for (let i in game.players) {
		let isWinner = game.players[i].points == winningPoints;
		let isTurn = turnIndex == i;
		let isCurrentPlayer = game.players[i].id == account.id;
		let endGameVoted = game.players[i].endGameRequest === 'true';

		// add the player to the list
		gameInfo += /* html */ `
			<div class="gamePlayerListPlayer${isCurrentPlayer ? ` currentPlayer` : ``}">
				${(isWinner ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>`: ``)}
				${(isTurn ? `<u>` : ``)}
					${(isCurrentPlayer ? `<b>` : ``)}
						${game.players[i].name}: 
					${(!isCurrentPlayer ? `<b>` : ``)}
						<span class="points">
							${game.players[i].points}
						</span>
					</b>
				${(turnIndex == i ? `</u>` : ``)}
				${(endGameVoted && !game.inactive ? `<span class='material-symbols-rounded winnerIcon' title='Voted to end the game'>highlight_off</span>`: ``)}
			</div>
		`;
	}

	// set the content of the game info box
	gameInfoBox.html(gameInfo);

	// show the correct text for end game button
	const endGameButton = document.getElementById('endGameButton');
	let endGameCount = 0;
	for (let i in game.players) {
		endGameCount += (game.players[i].endGameRequest === 'true') & 1;
	}
	const votesLeft = game.players.length - endGameCount;
	endGameButton.textContent = game.players[currentPlayerIndex].endGameRequest === 'true' ? 'Don\'t End' : 'End Game';
	endGameButton.disabled = game.inactive;
	endGameButton.style.cursor = (game.inactive ? 'not-allowed' : 'pointer');
	endGameButton.title = (game.inactive ? 'The game is already over' : votesLeft + ' more vote' + (votesLeft === 1 ? '' : 's') + ' to end');

	setCanvasSize();

	chatInit();
}

function makeMove() {
	// first, get a list of all unlocked tiles
	var newTiles = getUnlockedTiles();

	$.ajax(
		location + '/php/makeMove.php',
		{
			data: {
				game: game.id,
				tiles: newTiles,
				user: account.id,
				pwd: account.pwd
			},
			method: "POST",
			success: function(data) {
				// var tab = window.open('about:blank', '_blank');
				// tab.document.write(data);
				jsonData = JSON.parse(data);
				if (jsonData.errorLevel === 0) {
					loadGame(game.id);
					loadGamesList();
					if (jsonData.status === 1) {
						textModal("Game Over!", jsonData.message);
					}

					let newPoints = 0;
					for (let i = 0; i < jsonData.data.newWords.length; i++) {
						newPoints += jsonData.data.newWords[i].points;
					}

					const gameControlsCell = document.getElementById('gameControlsCell');
					const pointsNumber = document.querySelector('.gamePlayerListPlayer.currentPlayer .points');
					const bound = pointsNumber.getBoundingClientRect();
					const newPointsOverlay = document.createElement('div');
					newPointsOverlay.classList.add('overlay');
					newPointsOverlay.style.color = 'green';
					newPointsOverlay.style.background = 'var(--background-2)';
					newPointsOverlay.style.boxShadow = '0 0 10px #00000060';
					newPointsOverlay.style.padding = '2px 5px';
					newPointsOverlay.style.borderRadius = '5px';
					newPointsOverlay.textContent = '+' + newPoints;
					gameControlsCell.appendChild(newPointsOverlay);
					newPointsOverlay.style.position = 'fixed';
					const overlayBound = newPointsOverlay.getBoundingClientRect();
					newPointsOverlay.style.top = (bound.y - overlayBound.height + 4) + 'px';
					newPointsOverlay.style.left = (bound.x + (bound.width / 2) - (overlayBound.width / 2)) + 'px';
					newPointsOverlay.classList.add('fadeUpOut');

					setTimeout(() => {
						newPointsOverlay.remove();
					}, 3000);
				} else {
					textModal("Error", jsonData.message);
				}
			},
			error: function() {
				console.error("Request could not be completed.");
			}
		}
	);
}

function checkPoints() {
	// first, get a list of all unlocked tiles
	var newTiles = getUnlockedTiles();

	// don't bother if there are no unlocked tiles
	if (newTiles.length < 1) {
		canvas.pointsPreview = false;
		return;
	}

	$.ajax(
		location + '/php/checkPoints.php',
		{
			data: {
				game: game.id,
				tiles: newTiles,
				user: account.id,
				pwd: account.pwd
			},
			method: "POST",
			success: function(data) {
				// var tab = window.open('about:blank', '_blank');
				// tab.document.write(data);
				jsonData = JSON.parse(data);
				if (jsonData.errorLevel === 0) {
					// find the first non-cross word
					let mainWordId = 0;
					for (let i = 0; i < jsonData.data.newWords.length; i++) {
						if (!jsonData.data.newWords[i].cross) {
							mainWordId = i;
							break;
						}
					}

					// draw the points box
					canvas.pointsPreview = {
						points: jsonData.data.newPoints,
						start: jsonData.data.newWords[mainWordId].pos.start,
						end: jsonData.data.newWords[mainWordId].pos.end
					}
				} else {
					// just clear the points box
					canvas.pointsPreview = false;
				}
			},
			error: function() {
				console.error("Request could not be completed.");
			}
		}
	);
}

function getUnlockedTiles() {
	// returns a simplified list of any unlocked tiles on the board
	var newTiles = [];
	for (let y in game.board) {
		for (let x in game.board) {
			if (game.board[y][x] && !game.board[y][x].locked) {
				let tile = game.board[y][x];
				newTiles.push({
					bankIndex: tile.bankIndex,
					blank: tile.blank,
					letter: tile.letter,
					x: tile.x,
					y: tile.y
				});
			}
		}
	}
	return newTiles;
}

function setBankOrder() {
	if (game.inactive) return;
	$.ajax(
		location + '/php/setBankOrder.php',
		{
			data: {
				user: account.id,
				pwd: account.pwd,
				game: game.id,
				bankOrder: JSON.stringify(canvas.bankOrder)
			},
			method: "POST",
			success: function(data) {
				const jsonData = JSON.parse(data);
				if (jsonData.errorLevel > 0) {
					// restore from the old bank order
					canvas.bankOrder = JSON.parse(JSON.stringify(oldOrder));

					// show an error message if the error level is high enough
					if (jsonData.errorLevel >= 2) {
						textModal("Error", jsonData.message);
					}
				}
			}
		}
	);
}

function moveBankLetter(from, to) {
	// "from" and "to" are both ORDER indicies

	// "from" represents the tile we are moving
	// "to" represents the index before which we are moving

	from = parseInt(from);
	to = parseInt(to);
	
	// account for element being removed before
	if (from < to) {
		to--;
	}

	// don't move the letter if from is the same as to
	if (from === to) {
		canvas.bank[from].hidden = false;
		return;
	}

	// store the order in case we need to revert
	const oldOrder = JSON.parse(JSON.stringify(canvas.bankOrder));
	
	// remove that letter from the order
	const fromBankIndex = canvas.bankOrder[from];
	canvas.bankOrder.splice(from, 1);

	// add the letter before "to"
	canvas.bankOrder.splice(to, 0, fromBankIndex);

	setBankOrder();
}

function shuffleBank() {
	// create the shuffling animation
	const animationTime = 370;
	canvas.animations.bankShuffle = new Animation(animationTime);

	setTimeout(() => {
		canvas.bankOrder = shuffleArr(canvas.bankOrder);
		setBankOrder();
	}, animationTime / 2);
}

function exchangeLetters() {
	// do some preliminary checks
	if (!account.id) {
		textModal("Error", "You must be signed in to skip your turn.");
		return;
	}
	if (!game) {
		textModal("Error", "You must be in a game to skip your turn.");
		return;
	}
	if (game.inactive) {
		textModal("Error", "You cannot skip your turn in an inactive game.");
		return;
	}
	if (game.players[parseInt(game.turn) % game.players.length].id != account.id) {
		textModal("Error", "You cannot skip your turn when it is not your turn.");
		return;
	}

	// show the letter bank in the letter exchange modal
	const letterBank = document.getElementById('letterExchangeBank');
	letterBank.innerHTML = '';
	const letterExchangeButton = document.getElementById('letterExchangeButton')
	letterExchangeButton.innerText = 'Skip Turn';
	let bank = game.players[parseInt(game.turn) % game.players.length].letterBank;
	for (let i in canvas.bankOrder) {
		letterBank.innerHTML += /* html */ `
			<button class='letter' data-bankindex='${canvas.bankOrder[i]}' aria-pressed='false'>
				<span class='letterLetter'>${bank[canvas.bankOrder[i]] ? bank[canvas.bankOrder[i]] : ``}</span>
				<span class='letterPoints'>${bank[canvas.bankOrder[i]] ? letterScores[bank[canvas.bankOrder[i]]] : ``}</span>
			</button>
		`;
	}

	
	$(letterBank).children('.letter').on('click', function() {
		const $this = $(this);
		$this.attr('aria-pressed', $this.attr('aria-pressed') === 'true' ? 'false' : 'true');
		let exchangeLetters = letterBank.querySelectorAll('[aria-pressed=true]');
		letterExchangeButton.textContent = `
			${exchangeLetters.length > 0
				? `
				Exchange ${
					exchangeLetters.length >= bank.length
					? `All`
					: exchangeLetters.length
				} Letter${
					exchangeLetters.length === 1
					? ``
					: `s`
				} and `
				: ``
			}Skip Turn
		`;
	});

	$('#letterExchangeModal').modalOpen();
}

function skipTurn() {
	let letterExchangeIndicies = [];
	let letterExchanges = $('#letterExchangeBank').children('[aria-pressed=true]').each(function() {
		letterExchangeIndicies.push($(this).attr('data-bankindex'));
	});

	textModal(
		`Skip Turn${letterExchanges.length > 0 ? ` and Exchange Letter${letterExchanges.length === 1 ? `` : `s`}` : ``}`,
		`Are you sure you want to ${letterExchanges.length > 0 ? `exchange ${letterExchanges.length >= 7 ? `all ` : ``}${letterExchanges.length} letter${letterExchanges.length === 1 ? `` : `s`} and ` : ``}forfeit your turn?`,
		{
			cancelable: true,
			complete: () => {
				$.ajax(
					location + '/php/skipTurn.php',
					{
						data: {
							user: account.id,
							pwd: account.pwd,
							game: game.id,
							redrawLetters: JSON.stringify(letterExchangeIndicies)
						},
						method: "POST",
						success: function(data) {
							// var tab = window.open('about:blank', '_blank');
							// tab.document.write(data);
							let jsonData = JSON.parse(data);
							if (jsonData.errorLevel <= 0) {
								textModal((jsonData.status === 1 ? "Game Over!" : "Turn Skipped"), jsonData.message);
								$('#letterExchangeModal').modalClose();
								loadGame(game.id);
								loadGamesList();
							} else {
								textModal("Error", jsonData.message);
							}
						},
						error: function() {
							console.error("Could not skip turn.");
						}
					}
				);
			}
		}
	);
}

function pickLetter(bankIndex, complete = function(letter) {}) {
	let $letterPicker = $('#letterPicker');
	$('#chooseLetterModal').modalOpen();
	$letterPicker[0].focus();
	$letterPicker.val('').off().on('keyup', function() {
		if ($letterPicker.val()) {
			if (/[A-Za-z]/.test($letterPicker.val())) {
				$letterPicker.off();
				$letterPicker[0].blur();
				document.scrollTop = 0;
				complete($letterPicker.val().toUpperCase());
				$('#chooseLetterModal').modalClose();
			} else {
				$letterPicker.val('');
			}
		}
	}).on('blur', function() {
		canvas.bank[bankIndex].hidden = false;
		$('#chooseLetterModal').modalClose();
	});
}

function addLetter(x, y, bankIndex) {
	var bank;
	for (let i in game.players) {
		if (game.players[i].id == account.id) {
			bank = game.players[i].letterBank;
			break;
		}
	}

	var letter = bank[bankIndex];

	var blank = !letter;

	if (blank) {
		pickLetter(bankIndex, function(letter) {
			game.board[y][x] = new Tile(x, y, letter, bankIndex, blank, false);
			checkPoints();
		});
		return;
	}
	
	letter = letter[0].toUpperCase();

	game.board[y][x] = new Tile(x, y, letter, bankIndex, blank, false);
}

function removeLetter(x, y) {
	// remove the letter from the board and show it in the letter bank
	$('.letterBank .letter:nth-child(' + (parseInt(game.board[y][x].bankIndex) + 1) + ')').show();
	game.board[y][x] = null;
}

function Tile(x, y, letter, bankIndex, blank, locked, pixelX, pixelY) {
	this.x = x;
	this.y = y;
	this.letter = letter;
	this.bankIndex = bankIndex;
	this.blank = blank;
	this.locked = locked;
	if (pixelX || pixelY) {
		this.pixelX = pixelX;
		this.pixelY = pixelY;
	}
}

// Fisher-Yates Shuffle (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
function shuffleArr(a) {
	let b=a.length,c;while(b!=0){c=Math.floor(Math.random()*b);b--;[a[b],a[c]]=[a[c],a[b]];}return a;
}

function showTab(tab) {
	document.getElementById('scrabbleGrid').dataset.tab = tab;

	// scroll to the top of the games list
	$('#activeGames .gamesListWrapper')[0].scrollTop = 0;

	// read the chat
	if (tab === 'chat') readChat();
}