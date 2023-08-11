function updateGamesList(dispMode = localStorage.gameListDisplayMode || "card") {
    if (!account.games) return;

    if (!document.getElementById('gamesCell').dataset.displaymode) {
        setDisplayMode(dispMode);
        return;
    }

    // split the games list into active and inactive
    let activeGames = [];
    let inactiveGames = [];
    for (let i = 0; i < account.games.length; i++) {
        const game = account.games[i];

        // convert date strings to date objects
        game.lastUpdate = new Date(game.lastUpdate);
        if (game.endDate) game.endDate = new Date(game.endDate);

        // add to appropriate array
        if (game.inactive) {
            inactiveGames.push(game);
        } else {
            activeGames.push(game);
        }
    }

    // do the active games
    updateActiveGamesList(activeGames, dispMode);

    // do the inactive games
    updateInactiveGamesList(inactiveGames, dispMode);

    // show newly inactive games
    const newlyInactiveGames = inactiveGames.filter(game => game.newlyInactive);
    if (newlyInactiveGames.length) showNewlyInactiveGames(newlyInactiveGames);
}


function updateActiveGamesList(games, dispMode = "card") {
    // sort by last update timestamp 
    games.sort(function(a, b) {
        if (a.lastUpdate > b.lastUpdate) return -1; // a comes before b (in the display order)
        if (a.lastUpdate < b.lastUpdate) return 1; // a comes after b
        return 0; // a must be equal to b
    });

    // then sort by whether it is the current user's turn
    games.sort(function(a, b) {
        let aTurn = parseInt(a.players[parseInt(a.turn) % a.players.length].id) === account.id;
        let bTurn = parseInt(b.players[parseInt(b.turn) % b.players.length].id) === account.id;
        if (aTurn && !bTurn) return -1;
        if (!aTurn && bTurn) return 1;
        return 0;
    });

    // show empty list message if needed
    document.getElementById('activeGamesListMessage').innerHTML = games.length ? "" : "You have no active games. Create a new one below.";

    // generate the content
    let content = ``;
    for (let i = 0; i < games.length; i++) {
        content += dispMode === "list" ? activeGameLI(games[i]) : activeGameCard[games[i]];
    }

    // add the new game card
    content += /* html */ `
        <button class="newGameCard" onclick="newGame()">
            <span class="material-symbols-rounded largeIcon">
                add
            </span>
            <span class="large">
                New Game
            </span>
            <span></span>
        <button>
    `;

    // update the DOM element
    const el = document.getElementById('activeGamesList');
    el.innerHTML = content;
}


function updateInactiveGamesList(games, dispMode = "card") {
    // sort by end date timestamp
    games.sort(function(a, b) {
        if (a.endDate > b.endDate || (a.endDate && !b.endDate)) return -1; // a comes before b (in the display order)
        if (a.endDate < b.endDate || (!a.endDate && b.endDate)) return 1; // a comes after b
        return 0; // a must be equal to b
    });

    // show empty list message if needed
    document.getElementById('inactiveGamesListMessage').innerHTML = games.length ? "" : "You have no inactive games. Once any game ends, it will be archived here.";

    // generate the content
    let content = ``;
    for (let i = 0; i < games.length; i++) {
        content += dispMode === "list" ? inactiveGameLI(games[i]) : inactiveGameCard(games[i]);
    }

    // update the DOM element
    const el = document.getElementById('inactiveGamesList');
    el.innerHTML = content;
}

function showNewlyInactiveGames(newlyInactiveGames) {
    const cardBox = document.createElement('div');
    cardBox.className = "flex stretch gap20";

    for (let i = 0; i < newlyInactiveGames.length; i++) {
        const game = newlyInactiveGames[i];

        game.newlyInactive = false;

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

    const plural = newlyInactiveGames.length > 1;
    
    const msg = document.createElement('span');
        msg.innerHTML = (plural ? "These games are" : "This game is") + " over and " + (plural ? "have" : "has") + " been archived. You can still view " + (plural ? "them" : "it") + " by pressing the <span class='material-symbols-rounded smallIcon'>chevron_right</span> button above the active games list.";
        msg.style.opacity = "0%";
        msg.style.transition = "opacity 0.37s";
        setTimeout(() => { // animate this in
            msg.style.opacity = "";
        }, 1500);
    txt.appendChild(msg);

    textModal(`Game${plural ? 's' : ''} Ended!`, txt);

    // animate each one
    const cards = cardBox.children;
    for (let i = 0; i < cards.length; i++) {
        endGameAnimation(cards[i]);
    }
}


function activeGameCard(game) {
    // get the current turn info
    let turnIndex = parseInt(game.turn) % game.players.length;
    let turnUser = parseInt(game.players[turnIndex].id);

    // find the winning point number
    let winningPoints = 1;
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].points > winningPoints) {
            winningPoints = game.players[i].points;
        }
    }

    // player list
    let playerListHTML = ``;
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        playerListHTML += /* html */ `
            <div class="listGamePlayerListPlayer">
                ${player.points === winningPoints ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>` : ``}
                <span>
                    <b>
                        ${i === turnIndex ? '<u>' : ''}
                        ${player.name}
                        ${i === turnIndex ? '</u>' : ''}
                    </b>
                    : ${player.points}
                </span>
                ${player.endGameRequest ? `<span class="material-symbols-rounded winnerIcon" title="Voted to end the game">highlight_off</span>` : ``}
            </div>
        `;
    }

    // content
    const content = /* html */ `
        <div class="listGame" id="listGame${game.id}">
            <div class="listGameTitleBox">
                <span class="listGameName" onclick="renameGame(${game.id}, 'list')">
                    ${game.name || `#${game.id}`}
                </span>
                ${game.name ? /* html */ `
                    <div class="gameIdLine">
                        #${game.id}
                    </div>
                ` : ``}
            </div>
            <div class="listGamePlayerList">
                ${playerListHTML}
            </div>
            <button class="openGameButton${turnUser === account.id ? " highlight" : ""}" onclick="loadGame(${game.id}, true)" data-gameid="${game.id}">
                ${turnUser === account.id ? "Play" : "View"}
            </button>
        </div>
    `;

    return content;
}

function inactiveGameCard(game) {
    // get the current turn info
    let turnIndex = parseInt(game.turn) % game.players.length;
    let turnUser = parseInt(game.players[turnIndex].id);

    // find the winning point number
    let winningPoints = 1;
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].points > winningPoints) {
            winningPoints = game.players[i].points;
        }
    }

    // player list
    let playerListHTML = ``;
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        playerListHTML += /* html */ `
            <div class="listGamePlayerListPlayer">
                ${player.points === winningPoints ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>` : ``}
                <span>
                    <b>${player.name}</b>
                    : ${player.points}
                </span>
            </div>
        `;
    }

    // content
    const content = /* html */ `
        <div class="listGame" id="listGame${game.id}">
            <div class="listGameTitleBox">
                <div class="gameTitleLine">
                    <span class="material-symbols-rounded smallIcon" style="padding: 5px">
                        inventory_2
                    </span>
                    <span class="listGameName" onclick="renameGame(${game.id}, 'list')">
                        ${game.name || `#${game.id}`}
                    </span>
                </div>
                ${game.name ? /* html */ `
                    <div class="gameIdLine">
                        #${game.id}
                    </div>
                ` : ``}
            </div>
            <div class="listGamePlayerList">
                ${playerListHTML}
            </div>
            <button class="openGameButton" onclick="loadGame(${game.id}, true)" data-gameid="${game.id}">
                View
            </button>
        </div>
    `;

    return content;
}

function activeGameLI(game) {
    const content = /* html */ `
        <button class="listGame" id="listGame${game.id}" onclick="loadGame(${game.id}, false)">
            <div class="listGameTitleBox">
                <span class="listGameName ellipsis" onclick="renameGame(${game.id}, 'list')">
                    ${game.name || `#${game.id}`}
                </span>
                ${game.name ? /* html */ `
                    <div class="gameIdLine">
                        #${game.id}
                    </div>
                ` : ``}
            </div>
            <span class="material-symbols-rounded smallIcon textColorLight">
                chevron_right
            </span>
        </button>
    `;

    return content;
}

function inactiveGameLI(game) {
    return activeGameLI(game);
}



function updateGamesListOld() {
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
		cardBox.className = "flex stretch gap20";

		for (let i = 0; i < newlyInactiveGames.length; i++) {
			const game = newlyInactiveGames[i];

			game.newlyInactive = false;

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

		const plural = newlyInactiveGames.length > 1;
		
		const msg = document.createElement('span');
			msg.innerHTML = (plural ? "These games are" : "This game is") + " over and " + (plural ? "have" : "has") + " been archived. You can still view " + (plural ? "them" : "it") + " by pressing the <span class='material-symbols-rounded smallIcon'>chevron_right</span> button above the active games list.";
			msg.style.opacity = "0%";
			msg.style.transition = "opacity 0.37s";
			setTimeout(() => { // animate this in
				msg.style.opacity = "";
			}, 1500);
		txt.appendChild(msg);

		textModal(`Game${plural ? 's' : ''} Ended!`, txt);

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

	// update the games list
	updateGamesList(mode);
}