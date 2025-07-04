const boardInfo = {
	modifiers: [
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
	],
	"scoreMultipliers": [
		{ "letter": 1, "word": 1 },
		{ "letter": 2, "word": 1 },
		{ "letter": 3, "word": 1 },
		{ "letter": 1, "word": 2 },
		{ "letter": 1, "word": 3 },
		{ "letter": 1, "word": 2 }
	]
};

let langInfo = {
	"english": {
		"alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
		"letterScores": { "A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 5, "L": 1, "M": 3, "N": 1, "O": 1, "P": 3, "Q": 10, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 4, "X": 8, "Y": 4, "Z": 10 },
		"letterDistribution": { "A": 9, "B": 2, "C": 2, "D": 4, "E": 12, "F": 2, "G": 3, "H": 2, "I": 9, "J": 1, "K": 1, "L": 4, "M": 2, "N": 6, "O": 8, "P": 2, "Q": 1, "R": 6, "S": 4, "T": 6, "U": 4, "V": 2, "W": 2, "X": 1, "Y": 2, "Z": 1, "": 2 },
		"letterReplacements": {},
		"dictionaryAddress": "https://www.merriam-webster.com/dictionary/",
		"languageAbbreviation": "en",
		"containsDoubleLetters": false
	},
	"spanish": {
		"alphabet": ["A", "B", "C", "CH", "D", "E", "F", "G", "H", "I", "J", "L", "LL", "M", "N", "Ñ", "N~", "O", "P", "Q", "R", "RR", "S", "T", "U", "V", "X", "Y", "Z"],
		"letterScores": { "A": 1, "B": 3, "C": 3, "CH": 5, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "L": 1, "LL": 8, "M": 3, "N": 1, "N~": 8, "O": 1, "P": 3, "Q": 5, "R": 1, "RR": 8, "S": 1, "T": 1, "U": 1, "V": 4, "X": 8, "Y": 4, "Z": 10 },
		"letterDistribution": { "A": 12, "B": 2, "C": 4, "CH": 1, "D": 5, "E": 12, "F": 1, "G": 2, "H": 2, "I": 6, "J": 1, "L": 4, "LL": 1, "M": 2, "N": 5, "N~": 1, "O": 9, "P": 2, "Q": 1, "R": 5, "RR": 1, "S": 6, "T": 4, "U": 5, "V": 1, "X": 1, "Y": 1, "Z": 1 },
		"letterReplacements": { "N~": "Ñ" },
		"dictionaryAddress": "https://www.collinsdictionary.com/us/dictionary/spanish-english/",
		"languageAbbreviation": "es",
		"containsDoubleLetters": true
	},
	"french": {
		"alphabet": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
		"letterScores": { "A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 10, "L": 1, "M": 2, "N": 1, "O": 1, "P": 3, "Q": 8, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 10, "X": 10, "Y": 10, "Z": 10 },
		"letterDistribution": { "A": 9, "B": 2, "C": 2, "D": 3, "E": 15, "F": 2, "G": 2, "H": 2, "I": 8, "J": 1, "K": 1, "L": 5, "M": 3, "N": 6, "O": 6, "P": 2, "Q": 1, "R": 6, "S": 6, "T": 6, "U": 6, "V": 2, "W": 1, "X": 1, "Y": 1, "Z": 1, "": 2 },
		"letterReplacements": {},
		"dictionaryAddress": "https://www.collinsdictionary.com/dictionary/french-english/",
		"languageAbbreviation": "fr",
		"containsDoubleLetters": false
	}
};

const windowTitle = "Scrabble - Colebot.com";

var game = {};

var dragged;

async function loadGamesList() {
	if (!account.id) return;

	// spin the reload button until list is loaded
	const button = document.getElementById('gamesListRefreshButton');
	button.classList.remove('spin');
	let int;
	let complete = false;

	await sleep(10);

	button.classList.add('spin');
	int = setInterval(() => {
		if (complete) {
			button.classList.remove('spin');
			clearInterval(int);
		}
	}, 370);

	const res = await request('loadPlayerGames.php', {
		user: account.id,
		pwd: account.pwd
	});

	// stop the reload button spinning
	complete = true;

	if (res.errorLevel > 0) { // error
		textModal("Error", res.message);
		return;
	}

	// display the new content
	account.games = res.data;
	updateGamesList();

	// blink the games list
	const gamesList = document.getElementById('activeGamesList');
	gamesList.style.opacity = "0";

	await sleep(10);

	gamesList.style.transition = "opacity 0.37s";
	gamesList.style.opacity = "1";

	await sleep(370);

	gamesList.style.transition = "";
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
	inputField.addEventListener('keydown', function (e) {
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
	const g = account.games.find(a => a.id === gameId);
	g.name = gameName;
	//g.lastUpdate = new Date();
	// ^^ we aren't doing this because it causes the layout to shift when renaming a game from the list

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

	if (game.loadingId) return;

	let animationCleanup = () => { };
	if (animation === 'expand') { // expanding animation of the play button
		let expandEl = document.querySelector('#listGame' + id + ' .openGameButton');

		// offline message
		if (!navigator.onLine) {
			expandEl.style.color = "white";
			expandEl.style.backgroundColor = "red";
			expandEl.style.borderColor = "transparent";

			const ogHTML = expandEl.innerHTML;
			expandEl.innerHTML = "No Connection";

			setTimeout(() => {
				setTimeout(() => {
					expandEl.style.color = "";
					expandEl.style.transition = "background-color 0.37s, border-color 0.37s";
					expandEl.style.backgroundColor = "";
					expandEl.style.borderColor = "";
					expandEl.innerHTML = ogHTML;

					setTimeout(() => {
						expandEl.style.transition = "";
					}, 370);
				}, 370);
			}, 1000);

			return;
		}

		// make position calculations
		const bounds = expandEl.getBoundingClientRect();
		const top = bounds.top;
		const left = bounds.left + (bounds.width / 2) - 30;

		// copy the element
		let dupEl = document.createElement(expandEl.tagName);
		dupEl.className = expandEl.className;
		dupEl.innerHTML = expandEl.innerHTML;

		// set up the animation
		dupEl.style.position = "fixed";
		dupEl.style.top = top + "px";
		dupEl.style.left = left + "px";
		dupEl.style.pointerEvents = "none";
		document.getElementById('scrabbleGrid').appendChild(dupEl);

		// run the expansion animation
		dupEl.classList.add('expandAnimation');
		setTimeout(function () { dupEl.remove() }, 740);

		// show loading status if it is taking too long
		expandEl.style.transition = "background-color 0.37s, color 0.37s, border-color 0.37s";
		let i = 0;
		const ogHTML = expandEl.innerHTML;
		const interval = setInterval(() => {
			expandEl.style.backgroundColor = (i % 2 === 0 ? 'var(--highlight)' : 'var(--background-3)');
			expandEl.style.color = (i % 2 === 0 ? 'var(--highlight-text)' : 'var(--text-color)');
			expandEl.style.borderColor = "transparent";

			if (i % 4 === 0) {
				expandEl.innerHTML = "Loading";
			} else if (i % 4 === 1) {
				expandEl.innerHTML = "Loading.";
			} else if (i % 4 === 2) {
				expandEl.innerHTML = "Loading..";
			} else if (i % 4 === 3) {
				expandEl.innerHTML = "Loading...";
			}

			i++;
		}, 370);

		animationCleanup = () => {
			clearInterval(interval);
			expandEl.style.transition = "";
			expandEl.style.backgroundColor = "";
			expandEl.style.borderColor = "";
			expandEl.style.color = "";

			expandEl.innerHTML = ogHTML;
		};
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

	game.loadingId = id;

	return request("loadGame.php", {
		user: account.id,
		pwd: account.pwd,
		game: id
	}).then(res => {
		animationCleanup();

		game.loadingId = undefined;

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
		game.loadingId = undefined;
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

		// store the chat draft in case the user has inputed some text
		const chatDraft = document.getElementById('chatInput').value;

		// set complete to true once the game has loaded
		loadGame(game.id, false, false).then(() => {
			complete = true;
			document.getElementById('chatInput').value = chatDraft;
			chatBoxResize();
		});
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
				//setGameEndVote(game.currentPlayerIndex, !voted);
				const g = account.games.find(a => a.id === game.id);
				const p = g.players.find(a => a.id === account.id);
				p.endGameRequest = !voted; // remember voted represents whether the user had *already* voted

				if (res?.data?.gameEnded) {
					if (res.data.gameDeleted) {
						showEndGameScreen({
							gameDeleted: true,
							winnerIndices: []
						});
						const gId = account.games.findIndex(a => a.id === game.id);
						account.games.splice(gId, 1);
					} else {
						showEndGameScreen({
							reason: "vote",
							gameDeleted: false,
							winnerIndices: res.data.winnerIndices
						});
						g.inactive = true;
					}
					updateGamesList();
					return;
				}

				updateGamesList();

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
	const bank = game.players[game.currentPlayerIndex].letterBank;

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
	const bankOrder = game.players[game.currentPlayerIndex].bankOrder;

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

	let gameBannerParams;
	if (!userTurn) {
		setOOTD(true);
		gameBannerParams = [
			(game.inactive ? "This game has ended and is now archived." : "It isn't your turn, but you can still draft your next move."),
			getComputedStyle(document.documentElement).getPropertyValue('--text-highlight')
		];
	} else {
		setOOTD(false);
		gameBannerParams = [];
	}
	gameBanner(...gameBannerParams);
	canvas.gameBannerParams = gameBannerParams;

	// show the game info
	updateGameInfo();

	//setTimeout(startChangeCheck, 3000);

	chatInit();

	updateMoveHistory();

	document.getElementsByClassName('moreGameControls')[0].removeAttribute('open');

	setCanvasSize();

	setMoveButtonEnablementTo(false);

	loadDraft();

	if (!account.tutorials?.firstGame) {
		startTutorial(firstGameTutorial);
		setTutorial('firstGame', true);
	}
}

function updateGameInfo() {
	// start with the language, if not english
	let gameInfo = game.lang !== account.defaultLang ? /* html */ `
		<div class="gameLanguageBox bold">
			${game.lang.toTitleCase()}
		</div>
	` : ``;

	// start with the game name
	gameInfo += /* html */ `
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

	let turnIndex = parseInt(game.turn) % game.players.length;

	gameInfo += `<div class="gamePlayerList flex col">`;

	const showBankCounts = game.lettersLeft === 0;

	// add each player to the player list
	for (let i = 0; i < game.players.length; i++) {
		let isWinner = game.winnerIndices.includes(i);
		let isTurn = turnIndex == i;
		let isCurrentPlayer = game.players[i].id == account.id;
		let endGameVoted = game.players[i].endGameRequest;

		// add the player to the list
		gameInfo += /* html */ `
			<div class="gamePlayerListPlayer${isCurrentPlayer ? ` currentPlayer` : ``}${isTurn && !game.inactive ? ` fakeUnderline` : ``}" data-playerid="${game.players[i].id}">
				${(isWinner ? `<span class='material-symbols-rounded winnerIcon'>trophy</span>` : ``)}
				<span ${(isCurrentPlayer ? ` class="bold"` : ``)}>
					${game.players[i].name}: 
				</span>
				<span class="points bold">
					${game.players[i].points}
				</span>
				${(endGameVoted && !game.inactive ? `<span class='material-symbols-rounded winnerIcon endGameVoteIcon' title='Voted to end the game'>highlight_off</span>` : ``)}
				${showBankCounts ? /* html */ `<span class="playerBankCount" title="Letters in ${game.players[i].name}'s bank">${game.players[i].bankCount}</span>` : ``}
			</div>
		`;
	}

	// add the nudge button if it is available
	if (game.nudgeEnabled) {
		gameInfo += /* html */ `
			<div id="nudgeContainer" class="nudgeContainer flex col noGap">
				<button class="highlight" id="nudgeButton" onclick="nudge()">Nudge ${game.players[turnIndex].name}</button>
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
	endGameButton.textContent = game.players[game.currentPlayerIndex].endGameRequest ? 'Don\'t End' : 'End Game';
	endGameButton.disabled = game.inactive;
	endGameButton.style.cursor = (game.inactive ? 'not-allowed' : 'pointer');
	endGameButton.title = (game.inactive ? 'The game is already over' : votesLeft + ' more vote' + (votesLeft === 1 ? '' : 's') + ' to end');

	// show the correct text for the skip turn / exchange letters button
	const skipTurnButton = document.getElementById('skipTurnButton');
	skipTurnButton.textContent = game.lettersLeft <= 0 ? 'Skip Turn' : 'Exchange Letters';
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

async function makeMove() {
	// first, get a list of all unlocked tiles
	var newTiles = getUnlockedTiles(game.board);

	const res = await request('makeMove.php', {
		game: game.id,
		tiles: JSON.stringify(newTiles),
		user: account.id,
		pwd: account.pwd
	});

	if (res.errorLevel > 0) {
		textModal("Error", res.message);
		return;
	}

	// store the chat draft
	const chatDraft = document.getElementById('chatInput').value;

	// calculate the number of new points earned
	let newPoints = 0;
	for (let i = 0; i < res.data.newWords.length; i++) {
		newPoints += res.data.newWords[i].points;
	}

	// this is the game in the account games list
	// we will use this to update the games list without making a new request
	const g = account.games.find(a => a.id === game.id);

	if (res.status === 1) {
		// calculate the winner indices
		let winPts = 0;
		for (let i = 0; i < game.players.length; i++) {
			if (game.players[i].points > winPts) winPts = game.players[i].points;
		}
		let winds = [];
		for (let i = 0; i < game.players.length; i++) {
			if (game.players[i].points === winPts) winds.push(i);
		}

		showEndGameScreen({
			reason: "move",
			gameDeleted: false,
			winnerIndices: winds
		});

		g.inactive = true;
	} else { // the turn should not be updated when the game ends (not that it really matters)
		g.turn++;
	}

	const p = g.players.find(a => a.id === account.id); // add the new points
	p.points += newPoints;

	g.lastUpdate = new Date();
	updateGamesList(); // show the updated game in the games list

	// load the game
	await loadGame(game.id, "moveMade");

	// show a confirmation banner
	const bannerMessage = 'You scored ' + newPoints + ' point' + (newPoints === 1 ? '' : 's') + '. It\'s <b>' + game.players[game.turn % game.players.length].name + '</b>\'s turn now!';
	gameBanner(bannerMessage, getComputedStyle(document.documentElement).getPropertyValue('--highlight'));

	// highlight new letters in the player's bank
	for (let i = 0; i < res.data.newLetterIndices.length; i++) {
		const canvasLetter = canvas.bank.find(a => a.bankIndex === res.data.newLetterIndices[i]);
		canvasLetter.highlight = true;
	}

	// perform the flying saucer animation
	// (after a short timeout to let ui settle before important measurments take place)
	let mainWord = res.data.newWords.find(a => !a.cross);
	const destination = document.querySelector('.gamePlayerListPlayer[data-playerId="' + account.id + '"] .points');
	setTimeout(() => flyingSaucer(mainWord.axis === "x" ? mainWord.pos.end : mainWord.pos.start, newPoints, destination).then(() => {
		showPointsOverlay(account.id, newPoints);
	}), 10);

	// restore the chat draft
	document.getElementById('chatInput').value = chatDraft;
	chatBoxResize(); // show the changes we made
}

/**
 * 
 * @param {Pos} from the board position from which to start the animation
 * @param {string} value the innerHTML of the bubble
 * @param {DOMElement} destination the element at which to end the animation
 * @returns {Promise<none>} a promise that resolves once the animation is complete
 */
function flyingSaucer(from, value, destination) {
	return new Promise((resolve) => {
		// get the saucer element
		let saucer = document.getElementById('flyingSaucer');
		if (!saucer) {
			saucer = document.createElement("span");
			saucer.id = "flyingSaucer";
			saucer.classList.add('hidden');
			document.body.appendChild(saucer);
		}
		saucer.innerHTML = value;

		// calculate the pixel position to start from
		const fromPos = [
			((from[0] * (squareWidth + SQUARE_GAP)) + squareWidth) / BOARD_PIXEL_SCALE,
			(from[1] * (squareWidth + SQUARE_GAP)) / BOARD_PIXEL_SCALE
		];

		const boardBounds = canvas.c.getBoundingClientRect();

		// do the animation
		saucer.classList.remove('hidden');
		const sBounds = saucer.getBoundingClientRect();

		// set the starting position
		saucer.style.top = (boardBounds.top + fromPos[1] - (sBounds.height / 2)) + 'px';
		saucer.style.left = (boardBounds.left + fromPos[0] - (sBounds.width / 2)) + 'px';
		saucer.style.scale = 1;

		const duration = 750;
		const shrinkDuration = 100;

		setTimeout(() => {
			const d = (duration / 1000) + 's';
			const sd = (shrinkDuration / 1000) + 's';
			const ex = "cubic-bezier(.56,.08,.81,.6)";
			const ey = "cubic-bezier(.37,-0.47,.81,.6)";
			saucer.style.transition = `top ${d} ${ey}, left ${d} ${ex}, scale ${sd}`;

			const destBounds = destination.getBoundingClientRect();

			const destX = destBounds.left + (destBounds.width / 2);
			const destY = destBounds.top + (destBounds.height / 2);

			saucer.style.top = (destY - (sBounds.height / 2)) + 'px';
			saucer.style.left = (destX - (sBounds.width / 2)) + 'px';

			setTimeout(() => {
				saucer.style.scale = 0.25;
			}, duration - shrinkDuration);

			setTimeout(() => {
				saucer.classList.add('hidden');
				saucer.style.transition = "";
				saucer.style.scale = 1;

				resolve();
			}, duration);
		}, 10);
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

async function checkPoints() {
	canvas.pointsPreview = false;

	setMoveButtonEnablementTo(false);

	saveDraft(getUnlockedTiles(game.board));

	const words = await parseWords(game);

	if (!words || words.length === 0) return;

	// find the first non-cross word
	let mainWordId;
	for (let i = 0; i < words.length; i++) {
		if (!words[i].cross) {
			mainWordId = i;
			break;
		}
	}

	// if no word was made (this shouldn't ever happen because it should get caught above)
	if (mainWordId === undefined) {
		return;
	}

	// add up the total points
	let totalPoints = 0;
	for (let i = 0; i < words.length; i++) {
		totalPoints += words[i].points;
	}

	// draw the points box
	canvas.pointsPreview = {
		points: totalPoints,
		start: words[mainWordId].pos.start,
		end: words[mainWordId].pos.end
	}

	// show the draft in the move history
	updateMoveHistory(words);

	// enable the move button
	setMoveButtonEnablementTo(true);
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
	// "from" and "to" are both ORDER indices

	// "from" represents the tile we are moving
	// "to" represents the index before which we are moving (aka the new index of the tile)

	from = parseInt(from);
	to = parseInt(to);

	// account for element being removed before
	if (from < to) {
		to--;
	}

	// don't move the letter if from is the same as to
	if (from === to) {
		canvas.bank[canvas.bankOrder[from]].hidden = false;
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

function pickLetter(bankIndex, complete = function (letter) { }) {
	let $letterPicker = $('#letterPicker');
	const letterPicker = document.getElementById('letterPicker');
	$('#chooseLetterModal').modalOpen();
	letterPicker.focus();
	letterPicker.value = '';
	$letterPicker.off().on('keyup', function (e) {
		// check for letter in alphabet
		if (letterPicker.value) {
			if (!langInfo[game.lang].alphabet.includes(letterPicker.value.toUpperCase())) {
				letterPicker.value = '';
			} else if (!langInfo[game.lang].containsDoubleLetters || e.key === 'Enter') {
				$letterPicker.off();
				letterPicker.blur();
				document.scrollTop = 0;
				let letter = letterPicker.value.toUpperCase();
				let find;
				if (find = Object.keys(langInfo[game.lang].letterReplacements).find(key => langInfo[game.lang].letterReplacements[key] === letter)) letter = find;
				complete(letter);
				$('#chooseLetterModal').modalClose();
			}
		}
	}).on('blur', function () {
		canvas.bank[bankIndex].hidden = false;
		$('#chooseLetterModal').modalClose();
	});
}

function addLetter(x, y, bankIndex, assignedLetter = false) {
	if (game.inactive) return;

	if (!isValidBoardPos(x, y)) return;

	if (game.board[y][x]) return;

	const bank = game.players[game.currentPlayerIndex].letterBank;

	let letter = bank[bankIndex];
	const blank = !letter;

	if (blank && assignedLetter) {
		letter = assignedLetter;
	}

	if (blank && !assignedLetter) {
		pickLetter(bankIndex, function (letter) {
			game.board[y][x] = new Tile(x, y, letter, bankIndex, blank, false);
			boardUpdate();
			checkPoints();
		});
		return;
	}

	letter = letter.toUpperCase();

	// create a new tile in the specified position
	game.board[y][x] = new Tile(x, y, letter, bankIndex, blank, false);

	// hide the letter from the canvas bank
	canvas.bank[bankIndex].hidden = true;

	boardUpdate();

	return game.board[y][x];
}

function removeTileFromBoard(x, y) {
	let tile = game.board[y][x];
	if (!tile || tile.locked) return false;

	canvas.bank.find(a => a.bankIndex === tile.bankIndex).hidden = false;
	game.board[y][x] = null;
	return true;
}

function isValidBoardPos(x, y) {
	return x >= 0 && x < 15 && y >= 0 && y < 15;
}

class Tile {
	constructor(x, y, letter, bankIndex, blank, locked, pixelX, pixelY) {
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
}