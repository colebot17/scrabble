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
	// update in account games list
	account.games.find(a => a.id === gameId).name = gameName;

	// update the games list
	updateGamesList();

	// if the game is currently loaded
	if (game?.id === gameId) {
		game.name = gameName || ""; // set name in game obj

		// update the title box
		const nameField = document.querySelector('#gameControlsCell .gameName');
		const idLine = document.querySelector('#gameControlsCell .gameIdLine');

		nameField.textContent = gameName || '#' + gameId;
		idLine?.remove();
		if (gameName) {
			const idEl = document.createElement('div');
			idEl.classList.add('gameIdLine');
			idEl.innerHTML = '#' + gameId;
			nameField.after(idEl);
		}
	}

	// define elements to be updated
	const titleBoxes = document.querySelectorAll('#listGame' + gameId + ' .listGameTitleBox, #gameControlsCell .gameTitleBox');
	const nameFields = document.querySelectorAll('#listGame' + gameId + ' .listGameName, #gameControlsCell .gameName');
	const idLines = document.querySelectorAll('#listGame' + gameId + ' .gameIdLine, #gameControlsCell .gameIdLine');

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

function loadGame(id = prompt("Enter the id of the game you want to load:"), animation = false, updateHistory = true) {
	if (!id) return;
	
	let animationCleanup = () => {};
	if (animation === 'expand') { // expanding animation of the play button
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
	} else if (animation === "flash") { // animation of list items
		const liEl = document.getElementById('listGame' + id);
		const liElBounds = liEl.getBoundingClientRect();
		const liElCSS = getComputedStyle(liEl);

		const online = navigator.onLine;

		// create the element
		const dupEl = document.createElement('div');
		dupEl.style.position = "fixed";
		dupEl.style.width = liElBounds.width + 'px';
		dupEl.style.height = liElBounds.height + 'px';
		dupEl.style.lineHeight = liElBounds.height + 'px';
		dupEl.style.color = "var(--highlight-text)";
		dupEl.style.top = liElBounds.top + 'px';
		dupEl.style.left = liElBounds.left + 'px';
		dupEl.style.opacity = "100%";
		dupEl.style.borderRadius = liElCSS.getPropertyValue('border-radius');
		dupEl.style.background = "var(--background-2)";
		dupEl.style.transition = "0.37s scale, 0.37s top, 0.37s height, 0.37s opacity, 0.37s background-color";

		document.getElementById('scrabbleGrid').appendChild(dupEl);

		if (!online) {
			dupEl.style.color = "white";
			dupEl.style.background = "red";

			dupEl.textContent = "No Connection";

			setTimeout(() => {
				dupEl.style.opacity = "0%";
				setTimeout(() => {
					dupEl.remove();
				}, 370);
			}, 1000);

			return;
		}

		let flash, fNum = 0;

		setTimeout(() => {
			flash = setInterval(() => {
				dupEl.style.background = fNum % 2 === 0 ? "var(--highlight)" : "var(--background-3)";

				if (fNum % 4 === 0) {
					dupEl.textContent = "Loading";
				} else if (fNum % 4 === 1) {
					dupEl.textContent = "Loading.";
				} else if (fNum % 4 === 2) {
					dupEl.textContent = "Loading..";
				} else if (fNum % 4 === 3) {
					dupEl.textContent = "Loading...";
				}

				fNum++;
			}, 370);
		}, 10);

		animationCleanup = () => {
			clearInterval(flash);

			dupEl.style.opacity = "0%";
			dupEl.style.scale = "5";
			dupEl.style.background = "var(--background-3)";
			dupEl.style.pointerEvents = "none";
			dupEl.innerHTML = "";

			setTimeout(() => {
				dupEl.remove();
			}, 370);
		}
	} else if (animation === 'loader') {
		const el = document.createElement('div');
		el.style.position = 'fixed';
		el.style.left = '0';
		el.style.right = '0';
		el.style.top = '0';

		el.style.lineHeight = '100vh';
		
		el.style.transition = "opacity 0.37s";

		if (!navigator.onLine) {
			el.style.background = "#FF000033";
			el.style.color = "white";
			el.innerHTML = "No Connection";

			setTimeout(() => {
				el.style.opacity = "0%";
				setTimeout(() => {
					el.remove();
				}, 370);
			}, 1000);

			document.getElementById('scrabbleGrid').appendChild(el);

			return;
		}

		el.style.background = 'var(--selection-color)';
		el.style.color = 'white';

		el.innerHTML = ".";

		let timeout = setTimeout(() => {
			el.innerHTML = "Loading Game";
		}, 500);

		document.getElementById('scrabbleGrid').appendChild(el);

		animationCleanup = () => {
			clearTimeout(timeout);

			el.style.opacity = "0%";
			setTimeout(() => {
				el.remove();
			}, 370);
		}
	} else if (animation === 'scrabbleLoader') {
		const sGrid = document.getElementById('scrabbleGrid');
		sGrid.dataset.signedin = 'loading';

		animationCleanup = () => {
			sGrid.dataset.signedin = 'true';
		}
	}

	return request("loadGame.php", {
		user: account.id,
		pwd: account.pwd,
		game: id
	}).then(res => {
		animationCleanup();

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
		if (updateHistory) updateGameHistoryState(game.id);
	}).catch(err => {
		animationCleanup();
		throw new Error(err);
	});
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
		loadGame(game.id, false, false).then(() => complete = true);
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

	gameInfo += `<div class="gamePlayerList flex col">`;

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

	gameInfo += `</div>`;

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

	setTimeout(startChangeCheck, 3000);

	chatInit();

	updateMoveHistory();

	document.getElementsByClassName('moreGameControls')[0].removeAttribute('open');

	setCanvasSize();
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

function gameBanner(content, color, textColor = "", temp = false) {
	const wrapper = document.getElementById('gameBannerWrapper');
	const banner = document.getElementById('gameBanner');
	if (content) {
		banner.innerHTML = content;
		banner.style.backgroundColor = color;
		banner.style.color = textColor;

		wrapper.classList.remove('hidden');

		if (temp) {
			const bottom = wrapper.getBoundingClientRect().bottom;
			wrapper.style.position = "absolute";
			wrapper.style.top = "-" + bottom + "px";
			wrapper.style.transition = "top 0.37s cubic-bezier(0.33333, 0, 0.66667, 0.33333)";

			setTimeout(() => {
				wrapper.style.top = "10px";
				
				setTimeout(() => {
					wrapper.style.transition = "top 0.37s cubic-bezier(0.33333, 0.66667, 0.66667, 1)";
					wrapper.style.top = "-" + bottom + "px";

					setTimeout(() => {
						wrapper.style.position = "";
						wrapper.style.transition = "";
						wrapper.style.top = "";

						gameBanner();
					}, 370);
				}, 1500);
			}, 10);
		}
	} else {
		banner.innerHTML = '';
		banner.style.backgroundColor = '';
		banner.style.color = '';
		wrapper.classList.add('hidden');
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
		if (res.errorLevel > 0) {
			// clear the points box
			canvas.pointsPreview = false;
			
			return;
		}

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
	}).catch(err => {
		console.error(err);

		if (!navigator.onLine) {
			gameBanner("No Connection", "red", "white");

			window.ononline = () => {
				gameBanner("Connection Restored", "#00ff00", "black", true);

				window.ononline = null;
			};
		} else {
			gameBanner("An unknown error occurred.", "red", "white");
		}
	});
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