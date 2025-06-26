// allows the user to put letters onto the board by hovering their mouse over and typing

const placeHistory = [/* [x, y] */];


function handleKeyPressOnTile(key, tile, x, y) {

    // handle backspace
    if (key === "Backspace") {
        if (placeHistory.length) removeTileFromBoard(...placeHistory.pop()); // pop the last placed tile and remove it
        return;
    }

    const letter = key.toUpperCase(); // get the capital letter

    // make sure the user has the letter still in their bank
    const bankItem = canvas.bank.find(a => a.letter.toUpperCase() === letter && a.hidden === false);
    if (!bankItem) return;


    if (tile) { // if the mouse is over an existing tile, find the next available spot
        searchForNextSpot()
    }
}

function searchForNextSpot(x, y) {
    // given a position, find the next open spot for a letter to be placed

    // scan forwards and downwards to find next empty spot
    let nextClearY; 
    for (let lookY = y; lookY < 15; lookY++) {
        if (!game.board[lookY][x]) {
            nextClearY = lookY;
            break;
        }
    }

    let nextClearX;
    for (let lookX = x; lookX < 15; lookX++) {
        if (!game.board[y][lookX]) {
            nextClearX = lookX;
            break;
        }
    }

    // todo: make sure it can go either way

    // determine which way is closer
    let xDiff = nextClearX - x, yDiff = nextClearY - y, vertical;
    if (xDiff < yDiff) {
        vertical = false;
    } else if (xDiff > yDiff) {
        vertical = true;
    } else {
        // if it's a tie, look backwards for "back support"
        let bsY;
        for (let lookY = y; lookY > 0; lookY--) {

        }
    }
}