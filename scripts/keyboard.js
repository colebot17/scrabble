// allows the user to put letters onto the board by hovering their mouse over and typing

const placeHistory = [/* [x, y] */];


function handleKeyPressOnTile(key, x, y, ctrl = false) {

    // handle backspace
    if (key === "Backspace") {
        if (ctrl) {
            clearBoard();
            return;
        }
        if (placeHistory.length) {
            if (removeTileFromBoard(...placeHistory.pop())) checkPoints(); // pop the last placed tile and remove it
        }
        return;
    }

    if (ctrl) return;

    const letter = key.toUpperCase(); // get the capital letter

    // make sure the user has the letter still in their bank
    const bankItem = canvas.bank.find(a => a.letter.toUpperCase() === letter && a.hidden === false);
    if (!bankItem) return;


    if (game.board[y][x]) { // if the mouse is over an existing tile, find the next available spot
        var nextPos = searchForNextSpot(x, y);
        if (isValidBoardPos(...nextPos) && game.board[nextPos[1]][nextPos[0]] == null) {
            addLetter(nextPos[0], nextPos[1], bankItem.bankIndex);
            placeHistory.push(nextPos);
            checkPoints();
        }
    } else { // if the mouse is over an empty spot, place the tile there
        addLetter(x, y, bankItem.bankIndex);
        placeHistory.push([x, y]);
        checkPoints();
    }
}

function searchForNextSpot(x, y) {
    // given a position, find the next open spot for a letter to be placed

    // scan forwards and downwards to find next empty spot
    let nextClearY, yDiff = 0;
    for (let lookY = y; lookY < 15; lookY++) {
        yDiff++;
        if (!isValidBoardPos(x, lookY) || !game.board[lookY][x] || !game.board[lookY][x].locked) {
            while (game.board[lookY]?.[x]) lookY++;
            nextClearY = lookY;
            break;
        }
    }

    let nextClearX, xDiff = 0;
    for (let lookX = x; lookX < 15; lookX++) {
        xDiff++;
        if (!isValidBoardPos(lookX, y) || !game.board[y][lookX] || !game.board[y][lookX].locked) {
            while (game.board[y]?.[lookX]) lookX++;
            nextClearX = lookX;
            break;
        }
    }

    // determine which way is closer
    if (xDiff < yDiff) {
        // going horizontal
        return [nextClearX, y];
    } else if (xDiff > yDiff) {
        // going vertical
        return [x, nextClearY];
    } else {
        // if it's a tie, look backwards for "back support"
        let bsY = 0;
        for (let lookY = y; lookY >= 0; lookY--) {
            if (!isValidBoardPos(x, lookY) || !game.board[lookY][x]) {
                break;
            }
            bsY++;
        }

        let bsX = 0;
        for (let lookX = x; lookX >= 0; lookX--) {
            if (!isValidBoardPos(lookX, y) || !game.board[y][lookX]) {
                break;
            }
            bsX++;
        }

        if (bsX > bsY) {
            // going horizontal
            return [nextClearX, y];
        } else { // slight horizontal bias
            // going vertical
            return [x, nextClearY];
        }
    }
}