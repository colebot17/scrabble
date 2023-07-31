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

const windowTitle = "Scrabble - Colebot.com";

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

		request('loadPlayerGames.php', {
			user: account.id,
			pwd: account.pwd
		}).then(res => {
			if (res.errorLevel > 0) { // error
				textModal("Error", res.message);
			} else { // success
				// stop the reload button spinning
				complete = true;

				// blink the games list
				var $gamesList = $('#activeGamesList');
				$gamesList.hide().fadeIn(370);

				// load the new content
				account.games = res.data;
				updateGamesList();

				// // done (for pull to refresh)
				// if (done) {
				// 	done();
				// }
			}
		}).catch(err => {
			throw new Error(err);
		});
	}
}

function winnerString(winners) {
	let str = "";
	if (winners.length === 1) {
		if (winners[0].id === account.id) {
			str = "You";
		} else {
			str = /* html */ `<b>${winners[0].name}</b>`;
		}
	} else if (winners.length === 2) {
		if (winners[0].id === account.id || winners[1].id === account.id) {
			str = "You and ";
			str += `<b>${winners.find(a => a.id !== account.id).name}</b>`;
		} else {
			str = /* html */ `<b>${winners[0].name}</b> and <b>${winners[1].name}</b>`;
		}
	} else if (winners.length >= 3) {
		for (let j = 0; j < winners.length; j++) {
			if (j < winners.length - 1) {
				str += /* html */ `<b>${winners[j].name}</b>, `;
			} else {
				str += /* html */ `and <b>${winners[j].name}</b>`;
			}
		}
	}
	return str;
}

function updateGamesList() {
	if (!account.games) return;

	if (localStorage.gameListDisplayMode) {
		setDisplayMode(localStorage.gameListDisplayMode);
	}

	var noActiveGames = true;
	var noInactiveGames = true;

	const activeGamesList = document.getElementById('activeGamesList');
	const inactiveGamesList = document.getElementById('inactiveGamesList');

	// empty all games lists
	Array.from(document.getElementsByClassName('gamesList')).forEach(v => {v.innerHTML = "";});

	const activeGamesListMessage = document.getElementById('activeGamesListMessage');
	const inactiveGamesListMessage = document.getElementById('inactiveGamesListMessage');

	// convert games object into two arrays, one for active games, and another for inactive games
	let activeGames = [];
	let inactiveGames = [];

	for (let i = 0; i < account.games.length; i++) {
		let currentGame = account.games[i];
		
		// convert the dates to date objects
		currentGame.lastUpdate = new Date(currentGame.lastUpdate);
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

	// sort the active games array by the last update timestamp 
	activeGames.sort(function(a, b) {
		if (a.lastUpdate > b.lastUpdate) { // a comes before b (in the display order)
			return -1;
		}
		if (a.lastUpdate < b.lastUpdate) { // a comes after b
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

	// we will store all the newly inactive games here
	let newlyInactiveGames = [];

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
				let endGameVoted = gamesArray[i].players[j].endGameRequest;
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
			activeGamesList.innerHTML += /* html */`
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
			`;
		} else { // if the game is inactive
			// check if the game has just ended
			if (gamesArray[i].newlyInactive) {
				newlyInactiveGames.push(gamesArray[i]);
			}

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

			const wstr = winnerString(winners);
			let winnerHTML = /* html */ `${wstr} won`;

			// add the game card to the list
			inactiveGamesList.innerHTML += /* html */ `
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
			`;
		}
	}

	// add the new game card to the end of the active games tab
	activeGamesList.innerHTML += /* html */ `
		<button class="newGameCard" onclick="newGame();">
			<span class="material-symbols-rounded largeIcon">
				add
			</span>
			<span class="large">
				New Game
			</span>
			<span></span>
		</button>
	`;

	// set the message for the active games list
	if (!noActiveGames) {
		activeGamesListMessage.innerHTML = "";
	} else {
		activeGamesListMessage.innerHTML = `You have no active games. Create a new one below.`;
	}

	// set the message for the inactive games list
	if (!noInactiveGames) {
		inactiveGamesListMessage.innerHTML = "";
	} else {
		inactiveGamesListMessage.innerHTML = `You have no inactive games. Once any game ends, it will be archived here.`;
	}

	// animate any newly inactive games
	if (newlyInactiveGames.length) {
		const cardBox = document.createElement('div');
		cardBox.className = "flex gap20";

		for (let i = 0; i < newlyInactiveGames.length; i++) {
			const game = newlyInactiveGames[i];

			//game.newlyInactive = false;

			const winners = [];
			for (let j = 0; j < game.winnerIndicies.length; j++) {
				winners.push(game.players[game.winnerIndicies[j]]);
			}

			const str = `<b>${game.name || "Game #" + game.id}</b> has ended. ${winnerString(winners)} won!`;
			const card = document.createElement('div');
				card.className = "miniGameCard";

				const titleBox = document.createElement('div');
					titleBox.className = "listGameTitleBox";

					const titleLine = document.createElement('div');
						titleLine.className = "gameTitleLine";

						const icon = document.createElement('span');
							icon.className = "material-symbols-rounded smallIcon";
							icon.innerHTML = "inventory_2";
						titleLine.appendChild(icon);

						const name = document.createElement('span');
							name.className = "listGameName";
							name.innerHTML = game.name ? game.name : '#' + game.id;
						titleLine.appendChild(name);

					titleBox.appendChild(titleLine);
					
					if (game.name) {
						const idLine = document.createElement('div');
							idLine.className = "gameIdLine";
							idLine.innerHTML = '#' + game.id;
						titleBox.appendChild(idLine);
					}

				card.appendChild(titleBox);

				const playersList = document.createElement('div');
					playersList.className = "listGamePlayerList";

					let winningPoints = 1;
					for (let j = 0; j < game.players.length; j++) {
						if (game.players[j].points > winningPoints) {
							winningPoints = game.players[j].points;
						}
					}

					for (let j = 0; j < game.players.length; j++) {
						const player = game.players[j];

						const playerEl = document.createElement('div');
							playerEl.className = "listGamePlayerListPlayer";

							if (player.points === winningPoints) {
								const icon = document.createElement('span');
									icon.className = "material-symbols-rounded smallIcon";
									icon.innerHTML = "military_tech";
								playerEl.appendChild(icon);
							}

							const text = document.createElement('span');
								text.innerHTML = `<b>${player.name}</b>: ${player.points}`;
							playerEl.appendChild(text);
						playersList.appendChild(playerEl);
					}
					
				card.appendChild(playersList);

			cardBox.appendChild(card);
		}

		const txt = document.createElement('div');
			txt.className = "flex col gap10";
		txt.appendChild(cardBox);
		
		const msg = document.createElement('span');
			msg.innerHTML = "This game is over and has been archived. You can still view it by pressing the <span class='material-symbols-rounded smallIcon'>chevron_right</span> button above the active games list.";
			msg.style.opacity = "0%";
			msg.style.transition = "opacity 0.37s";
			setTimeout(() => { // animate this in
				msg.style.opacity = "";
			}, 1500);
		txt.appendChild(msg);

		textModal(`Game${newlyInactiveGames.length > 1 ? 's' : ''} Ended!`, txt);

		// animate each one
		const cards = cardBox.children;
		for (let i = 0; i < cards.length; i++) {
			endGameAnimation(cards[i]);
		}
	}
	

	// // initiate the pull to refresh
	// PullToRefresh.init({
	// 	mainElement: "#activeGames .gamesListWrapper .gamesList",
	// 	onRefresh(done) {
	// 		loadGamesList(done);
	// 	}
	// });
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
	inputField.value = account.games.find(a => a.id === gameId).name || '#' + gameId;
	inputField.select();

	function removeInput() {
		inputField.remove();
		nameField.classList.remove('hidden');
	}
	
	// add the listeners
	inputField.addEventListener('keydown', function(e) {
		if (e.key === "Enter") {
			// rename the game
			let name = inputField.value;
			inputField.removeEventListener('blur', removeInput);
			inputField.disabled = true;
			inputField.style.cursor = "progress";

			if (name === '#' + gameId) name = "";
			request('renameGame.php', {
				user: account.id,
				pwd: account.pwd,
				game: gameId,
				name
			}).then(res => {
				if (res.errorLevel) {
					textModal("Error", res.message);
				} else {
					setGameName(gameId, res.data);
					// update chat read for current user if chat read is already up to date
					if (game && game.players[game.currentPlayerIndex].chatRead >= game.chat.length - 1) {
						readChat();
					}
				}
				removeInput();
			}).catch(err => {
				removeInput();
				nameField.style.color = "red";
				nameField.style.transition = "color 1s";
				setTimeout(() => {
					nameField.style.color = "";
					setTimeout(() => {
						nameField.style.transition = "";
					}, 1000);
				}, 1000);
				throw new Error(err);
			});
		} else if (e.key === "Escape") {
			removeInput();
		}
	});

	inputField.addEventListener('blur', removeInput);
}

function setGameName(gameId, gameName) {
	// define elements to be updated
	const titleBoxes = document.querySelectorAll('#listGame' + gameId + ' .listGameTitleBox, #gameControlsCell .gameTitleBox');
	const nameFields = document.querySelectorAll('#listGame' + gameId + ' .listGameName, #gameControlsCell .gameName');
	const idLines = document.querySelectorAll('#listGame' + gameId + ' .gameIdLine, #gameControlsCell .gameIdLine');

	account.games.find(a => a.id === gameId).name = gameName;
	nameFields.forEach(nf => nf.textContent = gameName || '#' + gameId);
	idLines.forEach(idLine => idLine.remove());
	if (gameName) { // if the game has a name
		// show the id line
		titleBoxes.forEach(tbEl => {
			const idEl = document.createElement('div');
			idEl.classList.add('gameIdLine');
			idEl.innerHTML = `#${gameId}`;
			tbEl.appendChild(idEl);
		});
	}
	if (game?.id === gameId) { // if the game is currently loaded
		game.name = gameName || ""; // set the name in game obj
	}
}

function loadGame(id = prompt("Enter the id of the game you want to load:"), animate = false) {
	if (id) {
		if (animate) { // expanding animation of the play button
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

		return request("loadGame.php", {
			user: account.id,
			pwd: account.pwd,
			game: id
		}).then(res => {
			// catch any errors
			if (res.errorLevel > 0) {
				textModal("Error", res.message);
				return;
			}

			game = res.data; // store the game in the game object

			// determine and store the current player index
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].id == account.id) {
					game.currentPlayerIndex = i;
					break;
				}
			}

			showTab('game');
			gameInit();
		}).catch(err => {
			throw new Error(err);
		});
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

	let voted = game.players[game.currentPlayerIndex].endGameRequest;
	
	let endGameCount = 0;
	for (let i in game.players) {
		if (game.players[i].endGameRequest) {
			endGameCount++;
		}
	}
	const votesLeft = game.players.length - endGameCount;
	const willBeDeleted = votesLeft <= 1;

	let confirmMsg;
	if (voted) {
		confirmMsg = "Do you really want to revoke your vote to end the game?";
	} else {
		confirmMsg = "Do you really want to cast your vote to end the game? " + (
			willBeDeleted
			? "You are the final player to do so, so the game will end."
			: "If you do, " + (votesLeft - 1) + " player" + ((votesLeft - 1) === 1 ? "" : "s") + " will still have to vote before the game ends."
		);
	}

	// get user confirmation for delete
	textModal("End Game", confirmMsg, {
		cancelable: true,
		complete: () => {
			const requestAddress = voted ? "unEndGame.php" : "endGame.php";
			const requestData = {
				user: account.id,
				pwd: account.pwd,
				game: game.id
			};
			
			// update update number twice if game will be deleted
			game.updateNumber += (willBeDeleted ? 2 : 1);

			request(requestAddress, requestData).then(res => {
				if (res.errorLevel > 0) {
					textModal("Error", res.message);
					return;
				}
				setGameEndVote(game.currentPlayerIndex, !voted);
				if (res?.data?.gameEnded) {
					if (res.data.gameDeleted) {
						showEndGameScreen({
							gameDeleted: true,
							winnerIndicies: []
						});
					} else {
						showEndGameScreen({
							reason: "vote",
							gameDeleted: false,
							winnerIndicies: res.data.winnerIndicies
						});
					}
					return;
				}
				textModal("End Game", res.message);
			}).catch(err => {
				throw new Error(err);
			});
		}
	});	
}

// initialize the game in the global variable 'game'
function gameInit() {
	setCanvasPage('canvas');

	canvasInit(); // initialize the canvas

	// get the current player
	let currentPlayerIndex;
	for (let i = game.players.length - 1; i >= 0; i--) {
		if (game.players[i].id == account.id) {
			currentPlayerIndex = i;
			break;
		}
	}

	game.currentPlayerIndex = currentPlayerIndex;

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
	
	// refresh handlers
	removeHandlers();
	addHandlers();

	// determine whether it is the current user's turn
	const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

	if (!userTurn) {
		setOOTD(true);
		gameBanner((game.inactive ? "This game has ended and is now archived." : "It isn't your turn. Any letters you place will not be saved."), "var(--text-highlight)");
	} else {
		setOOTD(false);
		gameBanner(false);
	}

	// show the game info
	
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
		let endGameVoted = game.players[i].endGameRequest;

		// add the player to the list
		gameInfo += /* html */ `
			<div class="gamePlayerListPlayer${isCurrentPlayer ? ` currentPlayer` : ``}${isTurn ? ` fakeUnderline` : ``}" data-playerid="${game.players[i].id}">
				${(isWinner ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>`: ``)}
				<span ${(isCurrentPlayer ? ` class="bold"` : ``)}>
					${game.players[i].name}: 
				</span>
				<span class="points bold">
					${game.players[i].points}
				</span>
				${(endGameVoted && !game.inactive ? `<span class='material-symbols-rounded winnerIcon endGameVoteIcon' title='Voted to end the game'>highlight_off</span>`: ``)}
			</div>
		`;
	}

	// set the content of the game info box
	document.querySelector('#gameControlsCell .gameInfoBox').innerHTML = gameInfo;

	// show the correct text for end game button
	const endGameButton = document.getElementById('endGameButton');
	let endGameCount = 0;
	for (let i in game.players) {
		endGameCount += (game.players[i].endGameRequest) & 1;
	}
	const votesLeft = game.players.length - endGameCount;
	endGameButton.textContent = game.players[currentPlayerIndex].endGameRequest ? 'Don\'t End' : 'End Game';
	endGameButton.disabled = game.inactive;
	endGameButton.style.cursor = (game.inactive ? 'not-allowed' : 'pointer');
	endGameButton.title = (game.inactive ? 'The game is already over' : votesLeft + ' more vote' + (votesLeft === 1 ? '' : 's') + ' to end');

	setCanvasSize();
	
	setTimeout(startChangeCheck, 3000);

	chatInit();

	updateMoveHistory();
}

function getPlayerLastTurn() {
	let playerLastTurn = game.turn - 1;
	while (game.players?.[playerLastTurn % game.players.length]?.id != account.id && playerLastTurn > -1) {
		playerLastTurn--;
	}
	return playerLastTurn;
}

function setOOTD(disabled) {
	const OOTD = '#makeMoveButton, #skipTurnButton';
	document.querySelectorAll(OOTD).forEach(el => {
		el.cursor = (disabled ? "not-allowed" : "");
		el.disabled = disabled;
		el.title = (disabled ? "It isn't your turn!" : "");
	});
}

function gameBanner(content, color, textColor = "") {
	const banner = document.getElementById('gameBanner');
	if (content) {
		banner.innerHTML = content;
		banner.style.backgroundColor = color;
		banner.style.color = textColor;
		banner.classList.remove('hidden');
	} else {
		banner.innerHTML = '';
		banner.style.backgroundColor = '';
		banner.style.color = '';
		banner.classList.add('hidden');
	}
	setCanvasSize();
}

function makeMove() {
	// first, get a list of all unlocked tiles
	var newTiles = getUnlockedTiles();

	request('makeMove.php', {
		game: game.id,
		tiles: JSON.stringify(newTiles),
		user: account.id,
		pwd: account.pwd
	}).then(res => {
		if (res.errorLevel === 0) {
			loadGame(game.id);
			loadGamesList();
			if (res.status === 1) {
				textModal("Game Over!", res.message);
			}

			let newPoints = 0;
			for (let i = 0; i < res.data.newWords.length; i++) {
				newPoints += res.data.newWords[i].points;
			}

			showPointsOverlay(account.id, newPoints);
		} else {
			textModal("Error", res.message);
		}
	}).catch(err => {
		throw new Error(err);
	});
}

function showPointsOverlay(userId, newPoints) {
	const gameControlsCell = document.getElementById('gameControlsCell');
	const pointsNumber = document.querySelector('.gamePlayerListPlayer[data-playerId="' + userId + '"] .points');
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
}

function checkPoints() {
	// first, get a list of all unlocked tiles
	var newTiles = getUnlockedTiles();

	// don't bother if there are no unlocked tiles
	if (newTiles.length < 1) {
		canvas.pointsPreview = false;
		return;
	}

	request('checkPoints.php', {
		game: game.id,
		tiles: JSON.stringify(newTiles),
		user: account.id,
		pwd: account.pwd
	}).then(res => {
		if (res.errorLevel === 0) {
			// find the first non-cross word
			let mainWordId = 0;
			for (let i = 0; i < res.data.newWords.length; i++) {
				if (!res.data.newWords[i].cross) {
					mainWordId = i;
					break;
				}
			}

			// draw the points box
			canvas.pointsPreview = {
				points: res.data.newPoints,
				start: res.data.newWords[mainWordId].pos.start,
				end: res.data.newWords[mainWordId].pos.end
			}
		} else {
			// just clear the points box
			canvas.pointsPreview = false;
		}
	}).catch(err => {
		console.error(err);
	})
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

	request('setBankOrder.php', {
		user: account.id,
		pwd: account.pwd,
		game: game.id,
		bankOrder: JSON.stringify(canvas.bankOrder)
	}).then(res => {
		if (res.errorLevel > 0) {
			// restore from the old bank order
			canvas.bankOrder = JSON.parse(JSON.stringify(oldOrder));

			// show an error message if the error level is high enough
			if (res.errorLevel >= 2) {
				textModal("Error", res.message);
			}
		}
	}).catch(err => {
		// restore from the old bank order
		canvas.bankOrder = JSON.parse(JSON.stringify(oldOrder));
		
		console.error(err);
	});
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

	// actually switch the letters halfway through the animation (when all the letters are in the middle)
	setTimeout(() => {
		canvas.bankOrder = shuffleArr(canvas.bankOrder);
		setBankOrder();
	}, animationTime / 2);

	// disable the shuffle button until the animation is complete
	canvas.bankShuffleButton.cooldown = setTimeout(() => {
		let btn = canvas.bankShuffleButton;
		btn.cooldown = undefined;
		btn.clicking = false;
	}, animationTime);
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

function addLetter(x, y, bankIndex, assignedLetter = false) {
	const bank = game.players[game.currentPlayerIndex].letterBank;

	let letter = bank[bankIndex];
	const blank = !letter;

	if (blank && assignedLetter) {
		letter = assignedLetter;
	}

	if (blank && !assignedLetter) {
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

function temporaryTitle(title, callback) {
    document.title = title;
    document.addEventListener('visibilitychange', e => {
        if (document.hidden === false) {
            document.title = windowTitle;
            callback();
        };
    });
}