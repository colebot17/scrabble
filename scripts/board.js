function clearBoard() {
    // remove all unlocked tiles from the board
    for (let y in game.board) {
        for (let x in game.board) {
            if (game.board?.[y]?.[x] && !game.board[y][x].locked) {
                game.board[y][x] = null;
            }
        }
    }

    // un-hide all letters in bank
    for (let i in canvas.bank) {
        canvas.bank[i].hidden = false;
        canvas.bank[i].gapAnimation = undefined;
        canvas.bank[i].extraGapAfter = 0;
    }
    canvas.gapBeforeBankAnimation = undefined;
    canvas.extraGapBeforeBank = 0;

    // remove points preview
    canvas.pointsPreview = false;

    boardUpdate();
}

function boardUpdate() {
    // this function is called immediately after the tiles present on the board are changed in any way
    
    setMoveButtonEnablement();
}

function setMoveButtonEnablement() {
    const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    if (!userTurn) return;
    // the move button will be disabled no matter what when it is not the current user's turn

    // make sure there are actually some unlocked tiles on the board
    const boardHasUnlockedTiles = false;
    for (let y = 0; y < game.board.length; y++) {
        for (let x = 0; x < game.board[y].length; x++) {
            if (!game.board[y][x].locked) {
                boardHasUnlockedTiles = true;
                break;
            }
        }
    }

    const moveButton = document.getElementById('makeMoveButton');
    moveButton.disabled = !boardHasUnlockedTiles;
    if (boardHasUnlockedTiles) {
        moveButton.title = "You must place tiles on the board to make a move.";
    }
}