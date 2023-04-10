var stopChecking = false;

function checkForChanges() {
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
        setTimeout(checkForChanges, 3000);
    }).catch((error) => {
        console.error(error);
        textModal('Error', 'An error occurred checking for changes. Try again?', {
            cancelable: true,
            complete: () => setTimeout(checkForChanges, 3000)
        });
    });
}

function update(updates) {
    for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        if (update.type === "move") {
            updateMove(update.data);
        } else if (update.type === "chatMessageSend") {
            addChatMessage(update.data.message, update.data.senderName);
        } else if (update.type === "chatMessageDeletion") {
            setChatMessageDeleted(update.data.messageId);
        } else if (update.type === "chatMessageRestoration") {
            setChatMessageRestored(update.data.messageId, update.data.content);
        } else {
            textModal('Game Changes', 'New data is available on the server. Reload to access.');
        }

        game.updateNumber++;
    }
}

/*
updateMove:

    data = {
        player: int,
        playerIndex: int,
        tiles: arr,
        newPoints: int
    }

*/

function updateMove(data) {
    // update points
    game.players[data.playerIndex].points += data.newPoints;
    const pointsBox = document.querySelector('.gamePlayerListPlayer[data-playerid="' + game.players[data.playerIndex].id + '"] .points');
    pointsBox.innerHTML = game.players[data.playerIndex].points;

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

    // change the actual data value (last so we can reference old value)
    game.turn = turn;
}

function addChatMessage(message, senderName) {
    const chatContentBox = document.getElementsByClassName('chatContent')[0];
    const scrolledBottom = Math.floor(chatContentBox.scrollHeight) === Math.floor(chatContentBox.getBoundingClientRect().height + chatContentBox.scrollTop);

    message.senderName = senderName;
    game.chat.push(message);
    chatInit(true, !scrolledBottom);

    if (!scrolledBottom) showChatUpdatePopup();
}

function setChatMessageDeleted(messageId) {
    game.chat[messageId].deleted = true;
    delete game.chat[messageId].message;
    chatInit(true, true);
}

function setChatMessageRestored(messageId, content) {
    game.chat[messageId].deleted = false;
    game.chat[messageId].message = content;
    chatInit(true, true);
}