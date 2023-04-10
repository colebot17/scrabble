var checkInterval;

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
    }).catch((error) => {
        console.error(error);
    });
}

function update(updates) {
    for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        if (update.type === "move") {
            updateMove(update.data);
        } else if (update.type === "chatMessageSend") {
            addChatMessage(update.data.message, update.data.senderName);
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
        } else if (boardPos?.locked) {
            reloadGame();
            return;
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
    message.senderName = senderName;
    game.chat.push(message);
    chatInit(false);
}