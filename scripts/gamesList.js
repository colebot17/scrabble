function updateGamesList(dispMode = localStorage.gameListDisplayMode || "card") {
    if (!account.games) return;

	// make sure the data attribute matches the current mode
    updateDisplayMode(dispMode);

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
        content += dispMode === "list" ? activeGameLI(games[i]) : activeGameCard(games[i]);
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
        </button>
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
    let turnIndex = parseInt(game.turn) % game.players.length;
    let turnUser = parseInt(game.players[turnIndex].id);

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
                ${playerList(game)}
            </div>
            <button class="openGameButton${turnUser === account.id ? " highlight" : ""}" onclick="loadGame(${game.id}, true)" data-gameid="${game.id}">
                ${turnUser === account.id ? "Play" : "View"}
            </button>
        </div>
    `;

    return content;
}

function inactiveGameCard(game) {
    let turnIndex = parseInt(game.turn) % game.players.length;
    let turnUser = parseInt(game.players[turnIndex].id);

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
                ${playerList(game)}
            </div>
            <button class="openGameButton" onclick="loadGame(${game.id}, true)" data-gameid="${game.id}">
                View
            </button>
        </div>
    `;

    return content;
}

function gameLI(game) {
    let additionalInfoString = "";

    if (!game.inactive) {
        // for active games, show the current turn
        let turnIndex = parseInt(game.turn) % game.players.length;
        let turnPlayer = game.players[turnIndex];

        let turnName = "<b><u>" + turnPlayer.name + "</u></b>'s";
        if (turnPlayer.id === account.id) turnName = "Your"

        additionalInfoString = turnName + " turn";
    } else {
        // for inactive games, show the winner(s)
        const winnerNames = [];
        for (let i = 0; i < game.winnerIndicies.length; i++) {
            const player = game.players[game.winnerIndicies[i]];

            // this ensures that "You" appears at the front of the list
            if (player.id === account.id) {
                winnerNames.unshift("You");
            } else {
                winnerNames.push(player.name);
            }

        }
        additionalInfoString = "<span class='flex'><span class='material-symbols-rounded smallIcon'>military_tech</span><span>" + nlList(winnerNames, "<b>", "</b>") + (winnerNames.length > 1 ? " tied!" : " won!") + "</span></span>";
    }

    const content = /* html */ `
        <button class="listGame" id="listGame${game.id}" onclick="loadGame(${game.id}, false)">
            <div class="flex col fullHeight">
                <span class="bold fullWidth ellipsis">
                    ${game.name || `#${game.id}`}
                </span>
                ${game.name ? /* html */ `
                    <div class="finePrint">
                        #${game.id}
                    </div>
                ` : ``}
            </div>
            <div class="flex col fullHeight">
				<span class="fullWidth ellipsis">
					${inlinePlayerList(game.players)}
				</span>
                <span class="fullWidth ellipsis">
                    ${additionalInfoString}
                </span>
			</div>
			<div class="flex col fullHeight">
				<span class="material-symbols-rounded textColorLight">
					chevron_right
				</span>
			</div>
        </button>
    `;

    return content;
}

function activeGameLI(game) {
    return gameLI(game);
}

function inactiveGameLI(game) {
    return gameLI(game);
}

function playerList(game) {
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
    let html = ``;
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        html += /* html */ `
            <div class="listGamePlayerListPlayer">
                ${player.points === winningPoints ? `<span class='material-symbols-rounded winnerIcon'>military_tech</span>` : ``}
                <span>
                    <b>
                        ${i === turnIndex && !game.inactive ? '<u>' : ''}
                        ${player.name}
                        ${i === turnIndex && !game.inactive ? '</u>' : ''}
                    </b>
                    : ${player.points}
                </span>
                ${player.endGameRequest && !game.inactive ? `<span class="material-symbols-rounded winnerIcon" title="Voted to end the game">highlight_off</span>` : ``}
            </div>
        `;
    }
	return html;
}

function inlinePlayerList(players) {
    // remove self
    const fPlayers = players.filter(p => p.id !== account.id);

	return "with " + nlList(getPropArray(fPlayers, 'name'), "<b>", "</b>");
}

function setDisplayMode(mode) {
	// store in local storage
	if (mode !== "card") { // card is the default and doesn't need to be stored
		localStorage.gameListDisplayMode = mode;
	} else {
		localStorage.removeItem('gameListDisplayMode');
	}

    // run the update function
	updateDisplayMode(mode);

	// update the games list using the new mode
	updateGamesList(mode);
}

function updateDisplayMode(mode = localStorage.gameListDisplayMode || "card") {
    // set the data attribute
	document.getElementById('gamesCell').dataset.displaymode = mode;

    // update the buttons
	const buttons = document.getElementsByClassName('displayModeButton');
	for (let i = 0; i < buttons.length; i++) {
		if (buttons[i].id === (mode + "ViewButton")) {
			buttons[i].setAttribute("aria-pressed", "true");
		} else {
			buttons[i].setAttribute("aria-pressed", "false");
		}
	}
}