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
}