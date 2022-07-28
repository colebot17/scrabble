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

var dictionary;
fetch("dictionary.json").then(response => {
	return response.json();
}).then(jsondata => dictionary = jsondata.words);

var dragged;

$(':root').css('--height', `${window.innerHeight}px`);
window.addEventListener('resize', () => {
	$(':root').css('--height', `${window.innerHeight}px`);
});

function loadGamesList(done) {
	if (account.id) {
		$.ajax(
			'loadPlayerGames.php',
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
						// spin the refresh button
						var $button = $('#gamesListRefreshButton');
						$button.removeClass('spin');
						setTimeout(function() {$button.addClass('spin');}, 10);
						setTimeout(function() {$button.removeClass('spin');}, 380);

						// blink the games list
						var $gamesList = $('#activeGamesList');
						$gamesList.hide().fadeIn(370);

						// load the new content
						account.games = jsonData.data;
						updateGamesList();

						// done (for pull to refresh)
						if (done) {
							done();
						}
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
		var noActiveGames = true;
		var noInactiveGames = true;

		var $activeGamesList = $('#activeGamesList');
		var $inactiveGamesList = $('#inactiveGamesList');
		$('.gamesList').empty(); // empty both game lists

		var $activeGamesListMessage = $('#activeGamesListMessage');
		var $inactiveGamesListMessage = $('#inactiveGamesListMessage');

		// convert games object to array
		let gamesArray = [];

		for (let i in account.games) {
			let currentGame = account.games[i];
			currentGame.id = parseInt(i);
			currentGame.lastMove = new Date(currentGame.lastMove); // convert the date to a date object
			gamesArray.push(currentGame);
		}

		// sort the games array by the last move timestamp 
		gamesArray.sort(function(a, b) {
			if (a.lastMove > b.lastMove) { // a comes before b
				return -1;
			}
			if (a.lastMove < b.lastMove) { // a comes after b
				return 1;
			}
			// a must be equal to b
			return 0;
		});

		// sort the games array by whether it is the current user's turn
		gamesArray.sort(function(a, b) {
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
					playerListHTML += `
						<div class='listGamePlayerListPlayer'>
							${(winners.includes(j) ? `<span class='material-icons winnerIcon'>emoji_events</span>` : ``)}
							<b>
								${(j == turnIndex ? `<u>` : ``)}
								${gamesArray[i].players[j].name}
								${(j == turnIndex ? `</u>` : ``)}
							</b>
							: 
							${gamesArray[i].players[j].points}
						</div>
					`;
				}
				playerListHTML = playerListHTML.substring(0, playerListHTML.length - 2); // remove the extra comma at the end

				// add the game card to the list
				$activeGamesList.append(`
					<div class="listGame" id="listGame${gamesArray[i].id}">
						<div class="listGameName">
							${gamesArray[i].name || `#${gamesArray[i].id}`}
							<span class="material-icons iconButton smallIcon">
								drive_file_rename_outline
							</span>
						</div>
						<div class="listGamePlayerList">
							${playerListHTML}
						</div>
						<button class="openGameButton${(turnUser == account.id ? " highlight" : "")}" onclick="loadGame(${gamesArray[i].id}, true)" data-gameid="${gamesArray[i].id}">
							${(turnUser == account.id ? "Play" : "View Game")}
						</button>
					</div>
				`);
			} else { // if the game is inactive
				noInactiveGames = false;
				let playerListHTML = ``;
				for (var j in gamesArray[i].players) { // add each player to the list of players in the card
					playerListHTML += `
						<div class="listGamePlayerListPlayer">
							${(winners.includes(j) ? "<span class='material-icons winnerIcon'>emoji_events</span>" : "")}
							<b>
								${gamesArray[i].players[j].name}
							</b>
							: ${gamesArray[i].players[j].points}
						</div>
					`;
				}
				playerListHTML = playerListHTML.substring(0, playerListHTML.length - 2); // remove the extra comma at the end

				// add the game card to the list
				$inactiveGamesList.append(`
					<div class="listGame" id="listGame${gamesArray[i].id}">
						<div class="listGameName">
							${gamesArray[i].name || `#${gamesArray[i].id}`}
							<span class="material-icons iconButton smallIcon">
								drive_file_rename_outline
							</span>
						</div>
						<div class="listGamePlayerList">
							${playerListHTML}
						</div>
						<button class="openGameButton" onclick="loadGame(${gamesArray[i].id}, true)" data-gameid="${gamesArray[i].id}">
							View Game
						</button>
					</div>
				`);
			}
		}

		// add the new game card to the end of the active games tab
		$activeGamesList.append(`
			<button class="newGameCard" onclick="newGame();">
				<span class="material-icons largeIcon">
					add
				</span>
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

		// initiate the pull to refresh
		PullToRefresh.init({
			mainElement: "#activeGames .gamesListWrapper .gamesList",
			onRefresh(done) {
				loadGamesList(done);
			}
		});
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

function addPlayerToNewGame(name = $('#createGamePlayerInput').val()) {
	var newGamePlayerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players);
	$.ajax(
		'getIdFromName.php',
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
						id: jsonData.value.id,
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

function updateNewGamePlayerList() {
	var newGamePlayerList = JSON.parse(document.getElementById('createGamePlayerList').dataset.players);
	document.getElementById('createGamePlayerList').innerHTML = "";
	for (let i in newGamePlayerList) {
		let playerEl = document.createElement("div");
		playerEl.className = "createGamePlayer";
		playerEl.innerHTML = (newGamePlayerList[i].id == account.id ? "<b>" : "") + newGamePlayerList[i].name + (newGamePlayerList[i].id == account.id ? "</b>" : "");
		document.getElementById('createGamePlayerList').append(playerEl);
	}
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
				if ($(this).val() === "") {
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
		'http://scrabble.colebot.com/newGame.php',
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
		let expandEl = $('#listGame' + id + ' button');
			// position the element
			let offset = expandEl.offset();
			let top = offset.top;
			let left = offset.left;
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
		$.ajax(
			'http://scrabble.colebot.com/loadGame.php',
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
	let confirmMsg = (
		voted
		? "Do you really want to revoke your vote to end the game?"
		: "Do you really want to cast your vote to end the game?"
	);
	// get user confirmation for delete
	textModal("End Game", confirmMsg, true, function() {
		// send the request
		$.ajax(
			(voted ? 'unEndGame.php' : 'endGame.php'),
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

	// create an object of the letter bank for the canvas
	var bank = game.players[currentPlayerIndex].letterBank;
	canvas.bank = [];
	for (var i = 0; i < bank.length; i++) {
		canvas.bank.push({
			letter: bank[i],
			hidden: false,
			position: {
				x: undefined,
				y: undefined
			},
			bankIndex: i
		});
	}

	// clear event listeners from canvas
	var $canvas = $(canvas.c);
	$canvas.off();

	// make the game tab visible
	$('#gameTabButton').removeClass('hidden');

	// go ahead and define the things we will disable when it isn't the user's turn
	var ootDisable = '#scrabbleCanvas, .letterBank .letter, #turnControlsCell button';

	// make sure everything is enabled (we will disable them again if we need to)
	$(ootDisable).css('cursor', '').off('mousedown touchstart');

	// make sure it is the user's turn
	if (!game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id) {
		// handle drag start on canvas
		var handleCanvasMouseDown = function(e) {
			e.preventDefault();
			// get the pixel position of the mouse/finger
			let x, y;
			if (e.type === 'touchstart') {
				x = e.changedTouches[0].clientX - this.getBoundingClientRect().left;
				y = e.changedTouches[0].clientY - this.getBoundingClientRect().top;
			} else {
				x = e.offsetX;
				y = e.offsetY;
			}

			// check letter bank first
			let inBank = false;
			// get the canvas.bank without hidden items
			let bank = [];
			for (var i = 0; i < canvas.bank.length; i++) {
				if (!canvas.bank[i].hidden) {
					bank.push(canvas.bank[i]);
				}
			}
			for (let i = bank.length - 1; i >= 0; i--) {
				xMatch = x > bank[i].position.x && x < bank[i].position.x + canvas.bankTileWidth;
				yMatch = y > bank[i].position.y && y < bank[i].position.y + canvas.bankTileWidth;
				if (xMatch && yMatch) { // if this is the one that the user has clicked on
					// get the current player
					let currentPlayerIndex;
					for (let j = game.players.length - 1; j >= 0; j--) {
						if (game.players[j].id == account.id) {
							currentPlayerIndex = j;
							break;
						}
					}

					// update the dragged piece
					dragged = new Tile(undefined, undefined, bank[i].letter || "", bank[i].bankIndex, false, false, x, y);
					canvas.bank[bank[i].bankIndex].hidden = true; // hide the letter from the bank
					inBank = true; // don't bother to check the board
					break; // no need to iterate any more
				}
			}

			// if that didn't work check the board
			let boardX = Math.floor(x / (squareWidth + squareGap));
			let boardY = Math.floor(y / (squareWidth + squareGap));
			let tile = game.board?.[boardY]?.[boardX];
			let locked = tile?.locked;
			if (!inBank && tile && !locked) {
				dragged = new Tile(undefined, undefined, tile.letter, tile.bankIndex, tile.blank, tile.locked, x, y);
				dragged.mouseOffset = {
					x: (boardX - (x / (squareWidth + squareGap))) * (squareWidth + squareGap),
					y: (boardY - (y / (squareWidth + squareGap))) * (squareWidth + squareGap)
				}
				game.board[boardY][boardX] = null;
			}

			// it's okay if nothing happens - there is some empty space on the canvas
		}
		$canvas.on("mousedown", handleCanvasMouseDown);
		$canvas.on("touchstart", handleCanvasMouseDown);

		// update position of tile when mouse moves during drag
		var handleCanvasMouseMove = function(e) {
			e.preventDefault();

			if (dragged) {
				// get the pixel position of the mouse/finger
				let x, y;
				if (e.type === 'touchmove') {
					x = e.changedTouches[0].clientX - this.getBoundingClientRect().left;
					y = e.changedTouches[0].clientY - this.getBoundingClientRect().top;
				} else {
					x = e.offsetX;
					y = e.offsetY;
				}

				// this one is pretty simple - if something is being dragged, update its position
				// (mouse offset is handled using the mouseOffset property when the tile is being drawn)
				if (dragged.pixelX && dragged.pixelY) {
					dragged.pixelX = x;
					dragged.pixelY = y;
				}
			}
		}
		$canvas.on("mousemove", handleCanvasMouseMove);
		$canvas.on("touchmove", handleCanvasMouseMove);

		var handleCanvasMouseUp = function(e) {
			if (dragged) {
				e.preventDefault();

				// get the pixel position of the mouse/finger
				let x, y;
				if (e.type === 'touchend') {
					x = e.changedTouches[0].clientX - canvas.c.getBoundingClientRect().left;
					y = e.changedTouches[0].clientY - canvas.c.getBoundingClientRect().top;
				} else {
					x = e.offsetX;
					y = e.offsetY;
				}

				let boardX = Math.floor(x / (squareWidth + squareGap));
				let boardY = Math.floor(y / (squareWidth + squareGap));

				// only if the letter was dropped on a free space on the board
				if ((x >= 0 && x <= canvas.c.width) && (y >= 0 && y <= canvas.c.width) && !game.board?.[boardY]?.[boardX]) {
					// add the letter to the appropriate spot on the board
					addLetter(boardX, boardY, dragged.bankIndex);
				} else { // if the letter was dropped anywhere else
					canvas.bank[dragged.bankIndex].hidden = false; // show the letter in the bank
				}
				dragged = undefined; // remove the dragged tile	
			}
		}
		$('html').on("mouseup", handleCanvasMouseUp);
		$('html').on("touchend", handleCanvasMouseUp);
	} else {
		// if it is not the current player's turn
		$ootDisable = $(ootDisable);

		$ootDisable.css('cursor', 'not-allowed'); // show not-allowed cursor
		$('.letterBank .letter').attr('draggable', false); // make the letters not draggable anymore

		$ootDisable.on('mousedown touchstart', function(e) {
			textModal((game.inactive ? "Inactive Game" : "Not your turn!"), (game.inactive ? "This game is inactive, meaning it can no longer be played. You can still look at it all you want, though." : "It's someone else's turn right now. Wait for your turn to make a move.")); // show an alert when the user tries to interact with the canvas or letter bank
		});
	}

	// show the game id
	$('#gameControlsCell .gameIdBox').html(`<b>#${game.id}</b>`);

	// update the player scores
	let scoreBox = $('#gameControlsCell .scoreBox').empty(); // empty the score box
	let turnIndex = parseInt(game.turn) % game.players.length;
	let turnUser = game.players[turnIndex].id;
	let winningPoints = 1;
	for (let i in game.players) {
		winningPoints = Math.max(winningPoints, game.players[i].points);
	}
	for (let i in game.players) {
		let isWinner = game.players[i].points == winningPoints;
		let isTurn = turnIndex == i;
		let isCurrentPlayer = game.players[i].id == account.id;
		scoreBox.append(
			"<div class='gamePlayerListPlayer'>" + // begin line
			(isWinner ? "<span class='material-icons winnerIcon'>emoji_events</span>" : "") + // trophy if winner
			(isTurn ? "<u>" : "") + // underline if turn
			(isCurrentPlayer ? "<b>" : "") + // bold start at name if current player
			game.players[i].name + // player name
			": " + // colon
			(!isCurrentPlayer ? "<b>" : "") + // bold start at points if not current players
			game.players[i].points + // points
			"</b>" + // end bold no matter what
			(turnIndex == i ? "</u>" : "") + // underline end if turn
			"</div>" // end line
		);
	}

	setCanvasSize();
}

// pick one letter from the letter bag (weighted random) and remove it from the bag
function pullLetter(bag = game.letterBag) {
	var longBag = [];
	for (let i in bag) {
		for (let j = 0; j < bag[i]; j++) {
			longBag.push(i);
		}
	}
	var letter = longBag[Math.floor(Math.random() * longBag.length)];
	bag[letter]--;
	return letter;
}

function makeMove() {
	// first, get a list of all unlocked tiles
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
	$.ajax(
		'http://scrabble.colebot.com/makeMove.php',
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
	let $letterBank = $('#letterExchangeBank').empty();
	$('#letterExchangeButton').text('Skip Turn');
	let bank = game.players[parseInt(game.turn) % game.players.length].letterBank;
	for (let i in bank) {
		$letterBank.append(
			`<div class='letter' data-bankindex='${i}'>
				<span class='letterLetter'>${bank[i] ? bank[i] : ``}</span>
				<span class='letterPoints'>${bank[i] ? letterScores[bank[i]] : ``}</span>
			</div>`
		);
	}

	$letterBank.children('.letter').on('click', function() {
		$(this).toggleClass('exchange');
		let exchangeLetters = $letterBank.children('.exchange');
		$('#letterExchangeButton').text(`${exchangeLetters.length > 0 ? `Exchange ${exchangeLetters.length >= 7 ? `All` : exchangeLetters.length} Letter${exchangeLetters.length === 1 ? `` : `s`} and ` : ``}Skip Turn`)
	});

	$('#letterExchangeModal').modalOpen();
}

function skipTurn() {
	let letterExchangeIndicies = [];
	let letterExchanges = $('#letterExchangeBank').children('.exchange').each(function() {
		letterExchangeIndicies.push($(this).attr('data-bankindex'));
	});

	textModal(
		`Skip Turn${letterExchanges.length > 0 ? ` and Exchange Letter${letterExchanges.length === 1 ? `` : `s`}` : ``}`,
		`Are you sure you want to ${letterExchanges.length > 0 ? `exchange ${letterExchanges.length >= 7 ? `all ` : ``}${letterExchanges.length} letter${letterExchanges.length === 1 ? `` : `s`} and ` : ``}forfeit your turn?`,
		true,
		function() {
			$.ajax(
				'skipTurn.php',
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
	);
}

function pickLetter(bankIndex, complete = function(letter) {}) {
	let letterPicker = $('#letterPicker');
	$('#chooseLetterModal').modalOpen();
	letterPicker[0].focus();
	letterPicker.val('').off().on('keyup', function() {
		if (letterPicker.val()) {
			letterPicker.off();
			letterPicker[0].blur();
			document.scrollTop = 0;
			complete(letterPicker.val().toUpperCase());
			$('#chooseLetterModal').modalClose();
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

// Fisher-Yates shuffle an array (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
function shuffleArr(a) {
	let b = a.length,  c;
	while (b != 0) {
		c = Math.floor(Math.random() * b);
		b--;
		[a[b], a[c]] = [
			a[c], a[b]];
	}
	return a;
}

function showTab(tab) {
	document.getElementById('scrabbleGrid').dataset.tab = tab;
	// scroll to the top of the games list
	$('#activeGames .gamesListWrapper')[0].scrollTop = 0;
}