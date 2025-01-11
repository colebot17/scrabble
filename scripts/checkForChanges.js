var stopChecking = false;
var checkTimeout = 0;

function startChangeCheck() {
    return;

    stopChecking = true;
    clearTimeout(checkTimeout);
    stopChecking = false;
    checkForChanges();
}

function checkForChanges() {
    return;

    if (stopChecking) return;
    request('checkForChanges.php', {
        user: account.id,
        pwd: account.pwd,
        game: game.id,
        updateNumber: game.updateNumber
    }).then((res) => {
        if (res.errorLevel > 0) {
            textModal('Error', res.message);
            return;
        }
        if (res.data.length > 0) {
            update(res.data);
        }
        checkTimeout = setTimeout(checkForChanges, 3000);
    }).catch((error) => {
        console.error(error);

        if (document.hidden) {
            showTab('home');
            return;
        }

        textModal('Error', 'An error occurred checking for changes. Try again?', {
            cancelable: true,
            complete: checkForChanges
        });
    });
}

/*

Change Types:
    chatMessageDeletion    - done
    chatMessageRestoration - done
    gameEnd                - done
    gameEndVote            - done
    gameEndVoteRevoke      - done
    move                   - done
    gameRename             - done
    chatMessageSend        - done
    turnSkip               - done

*/

function update(updates) {
    for (let i = 0; i < updates.length; i++) {
        const update = updates[i];

        switch(update.type) {
            case "move":
                updateMove(update.data);
                break;
            case "chatMessageSend":
                addChatMessage(update.data.message, update.data?.senderName);
                break;
            case "chatMessageDeletion":
                setChatMessageDeletion(update.data.messageId);
                break;
            case "chatMessageRestoration":
                setChatMessageDeletion(update.data.messageId, update.data.content);
                break;
            case "gameRename":
                setGameName(game.id, update.data.newName);
                break;
            case "gameEndVote":
                setGameEndVote(update.data.playerIndex, true);
                break;
            case "gameEndVoteRevoke":
                setGameEndVote(update.data.playerIndex, false);
                break;
            case "turnSkip":
                setTurn(update.data.newTurn);
                break;
            case "gameEnd":
                showEndGameScreen(update.data);
                break;
            default:
                textModal('Game Changes', 'New data is available on the server. Reload to access.');
        }

        game.updateNumber++;
    }
}

function updateMove(data) {
    if (document.hidden) { // show temporary title if page not visible
        const currentPlayerTurn = (game.turn + 1) % game.players.length == game.currentPlayerIndex;
        let tempTitle = game.players[data.playerIndex].name + " made their move!";
        if (currentPlayerTurn) tempTitle = "It's your turn! " + tempTitle;
        // don't actually perform the update until the user switches back (for the animation and performance)
        temporaryTitle(tempTitle, () => updateMove(data)); 
        return;
    }

    // update points
    game.players[data.playerIndex].points += data.newPoints;
    const pointsBox = document.querySelector('.gamePlayerListPlayer[data-playerid="' + game.players[data.playerIndex].id + '"] .points');
    pointsBox.innerHTML = game.players[data.playerIndex].points;
    showPointsOverlay(data.player, data.newPoints);

    // update the turn
    setTurn(game.turn + 1);

    // put each tile on the board, replacing any unlocked tiles into the letter bank
    for (let i = 0; i < data.tiles.length; i++) {
        const tile = data.tiles[i];
        let boardPos = game.board[tile.y][tile.x];
        if (boardPos !== null && !boardPos.locked) {
            canvas.bank[boardPos.bankIndex].hidden = false;
        }
        game.board[tile.y][tile.x] = tile;
        game.board[tile.y][tile.x].size = 0;
        game.board[tile.y][tile.x].animation = new Animation(750);
    }
}

function setTurn(turn) {
    // switch underline in player list
    const oldPlayerId = game.players[game.turn % game.players.length].id;
    const newPlayerId = game.players[turn % game.players.length].id;

    const oldTurnPlayer = document.querySelector('.gamePlayerListPlayer[data-playerid="' + oldPlayerId + '"]');
    const newTurnPlayer = document.querySelector('.gamePlayerListPlayer[data-playerid="' + newPlayerId + '"]');

    oldTurnPlayer.classList.remove('underline');
    newTurnPlayer.classList.add('underline');

    // enable/disable buttons and things, and set game banner
    if (game.players[turn % game.players.length].id == account.id) { // new turn is current user
        setOOTD(false);
        gameBanner(false);
    } else if (game.players[game.turn % game.players.length].id == account.id) { // last turn was current user
        setOOTD(true);
		gameBanner((game.inactive ? "This game has ended and is now archived." : "It isn't your turn. Any letters you place will not be saved."), "var(--text-highlight)");
    }
    setCanvasSize();

    // change the actual data value (last so we can reference old value)
    game.turn = turn;
}

function addChatMessage(message, senderName) {
    const chatContentBox = document.getElementsByClassName('chatContent')[0];
    const scrolledBottom = chatContentBox.scrollTop >= Math.floor(chatContentBox.scrollHeight - chatContentBox.getBoundingClientRect().height);

    if (senderName) message.senderName = senderName;
    game.chat.push(message);
    chatInit(true, !scrolledBottom);

    if (!scrolledBottom) showChatUpdatePopup();
}

function setGameEndVote(playerIndex, vote) {
    game.players[playerIndex].endGameRequest = vote;
    if (vote) {
        const player = document.querySelector('.gamePlayerListPlayer[data-playerid="' + game.players[playerIndex].id + '"]');
        const icon = document.createElement('span');
        icon.className = 'material-symbols-rounded winnerIcon endGameVoteIcon';
        icon.title = 'Voted to end the game';
        icon.innerHTML = 'highlight_off';
        player.appendChild(icon);
    } else {
        document.querySelector('.gamePlayerListPlayer[data-playerid="' + game.players[playerIndex].id + '"] .endGameVoteIcon').remove();
    }
    const endGameButton = document.getElementById('endGameButton');
    endGameButton.innerHTML = vote ? "Don't End" : "End Game";
    let endGameCount = 0;
    for (let i in game.players) {
        endGameCount += (game.players[i].endGameRequest) & 1;
    }
    const votesLeft = game.players.length - endGameCount;
    endGameButton.title = votesLeft + " more vote" + (votesLeft === 1 ? "" : "s") + " to end";
}

/**
 * Shows a textModal describing a reason for ending the game, then when it is closed,
 * switches to the inactive games screen and shows a confetti animation with the game card
 * @param {EndGameScreenData} data  {reason: "move|vote|skip",
							            gameDeleted: true|false,
							            winnerIndices: [...]
						            }
 */
function showEndGameScreen(data) {
    const endReasons = {
        move: "A player made the final move.",
        vote: "All players voted to end the game.",
        skip: "All players skipped their turn twice consecutively."
    };

    // create a string displaying the winner(s)
    let winnerString = ``;
    if (data.winnerIndices.length === 1) {
        winnerString = /* html */ `<b>${game.players[data.winnerIndices[0]].name}</b>`;
    } else if (data.winnerIndices.length === 2) {
        winnerString = /* html */ `<b>${game.players[data.winnerIndices[0]].name}</b> and <b>${game.players[data.winnerIndices[1]].name}</b>`;
    } else if (data.winnerIndices.length >= 3) {
        for (let i = 0; i < data.winnerIndices.length; i++) {
            if (i < data.winnerIndices.length - 1) {
                winnerString += /* html */ `<b>${game.players[data.winnerIndices[i]].name}</b>, `;
            } else {
                winnerString += /* html */ `and <b>${game.players[data.winnerIndices[i]].name}</b>`;
            }
        }
    }

    const message = /* html */ `
        This game is over! Good Job!
        <br><br>
        ${winnerString ? /* html */ `${winnerString} won.<br><br>` : ``}
        ${data.reason ? /* html */ `End Reason: ${endReasons[data.reason] || data.reason}<br><br>` : ``}
        ${data.gameDeleted
            ? `This game was deleted because no players scored any points.`
            : `This game has been archived to the inactive games page.`
        }
    `;

    // stop checking for changes if the game ended
    if (data.gameDeleted) stopChecking = true;

    loadGamesList();
    textModal("Game Over!", message, {
        complete: () => {
            showTab('home');
            setGamesList(data.gameDeleted ? 'active' : 'inactive');
            if (!data.gameDeleted) {
                endGameAnimation(document.getElementById('listGame' + game.id));
            }
        }
    });
}

var confetti;

/**
 * Slam in and confetti
 * @param {Element} el the element to animate
 * @returns 
 */
function endGameAnimation(el) {
    return new Promise(resolve => {
        el.style.scale = "500%";
        el.style.opacity = "0%";
        setTimeout(() => {
            el.style.transition = "scale 0.3s ease-in, opacity 0.3s ease-in";
            
            // start the animation
            el.style.scale = "100%";
            el.style.opacity = "100%";

            // pre-initialize the confetti
            if (!confetti) confetti = new Confetti();
            setTimeout(() => { // when the animation is over
                // find midpoint of card
                const cardBounds = el.getBoundingClientRect();
                const x = (cardBounds.x + (cardBounds.width / 2));
                const y = (cardBounds.y + (cardBounds.height / 2));

                confetti.startBurst(x, y); // explode the confetti

                // remove styles
                el.style.scale = "";
                el.style.opacity = "";
                el.style.transition = "";

                // resolve promise
                resolve();
            }, 300);
        }, 10);
    });
}