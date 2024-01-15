function addHandlers() {
    const canvas = document.getElementById('scrabbleCanvas');

    canvas.addEventListener('dblclick', handleCanvasDblClick);

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('touchstart', handleCanvasMouseDown);

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('touchmove', handleCanvasMouseMove);
    
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('touchend', handleDocumentMouseUp);

    document.addEventListener('keypress', handleDocumentKeyPress);
}
function removeHandlers() {
    const canvas = document.getElementById('scrabbleCanvas');

    canvas.removeEventListener('dblclick', handleCanvasDblClick);

    canvas.removeEventListener('mousedown', handleCanvasMouseDown);
    canvas.removeEventListener('touchstart', handleCanvasMouseDown);

    canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    canvas.removeEventListener('touchmove', handleCanvasMouseMove);
    
    document.removeEventListener('mouseup', handleDocumentMouseUp);
    document.removeEventListener('touchend', handleDocumentMouseUp);

    document.removeEventListener('keypress', handleDocumentKeyPress);
}

// define constants
const dropZoneAnimationTime = 50;

function handleCanvasDblClick(e) { // EVENT OBJECT MAY NOT BE AVAILABLE
    clearBoard();
}

// handle drag start on canvas
function handleCanvasMouseDown(e) {
    e.preventDefault();

	// determine whether it is the current user's turn
	// const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

    // cancel if a popup is open
    if (visiblePopups.length > 0) {
        return;
    }

    // check for double-tap
    if (e.type === 'touchstart') {
        if (canvas.doubleTap) {
            handleCanvasDblClick();
            return;
        }

        // set canvas.doubleTap
        canvas.doubleTap = true;
        setTimeout(() => {
            canvas.doubleTap = false;
        }, 500);
    }

    // get the pixel position of the mouse/finger
    let x, y, clientX, clientY;
    if (e.type === 'touchstart') {
        x = e.changedTouches[0].clientX - this.getBoundingClientRect().left;
        y = e.changedTouches[0].clientY - this.getBoundingClientRect().top;
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        x = e.offsetX;
        y = e.offsetY;
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // get what the mouse is over
    const overList = whatMouseIsOver(x, y);
    const overListCategories = getPropArray(overList, "category");

    // if the mouse is over a bank letter
    if (overListCategories.includes("bankLetter") && !game.inactive) {
        const overObj = overList[overListCategories.indexOf("bankLetter")];
        const orderIndex = overObj.orderIndex;

        const canvasLetter = canvas.bank[canvas.bankOrder[orderIndex]];

        // update the dragged piece
        dragged = {
            bankIndex: canvasLetter.bankIndex,
            blank: !canvasLetter.letter,
            letter: canvasLetter.letter,
            pixelX: x,
            pixelY: y
        };
        canvasLetter.hidden = true; // hide the letter from the bank

        // add a gap where the letter used to be
        if (orderIndex == 0) {
            canvas.extraGapBeforeBank = 1;
        } else {
            canvas.bank[canvas.bankOrder[orderIndex - 1]].extraGapAfter = 1;
        }

        // temporarily hide the points preview
        canvas.pointsPreview.hidden = true;

        // don't count for double tap
        canvas.doubleTap = false;

        setCanvasCursor(x, y);

        return; // don't bother checking anything else
    }

    // if the mouse is over the board
    if (overListCategories.includes("board")) {
        const overObj = overList[overListCategories.indexOf("board")];
        
        const tile = overObj.tile;
        const locked = tile?.locked;

        // initialize the drag if the tile is unlocked
        if (tile && !locked && !game.inactive) {
            dragged = {
                bankIndex: tile.bankIndex,
                blank: tile.blank,
                letter: tile.letter,
                mouseOffset: {
                    x: overObj.x * (squareWidth + SQUARE_GAP) - x,
                    y: overObj.y * (squareWidth + SQUARE_GAP) - y
                },
                pixelX: x,
                pixelY: y,
                posHistory: [{x, y}]
            };

            game.board[overObj.y][overObj.x] = null; // remove the tile from the board

            canvas.pointsPreview = false; // remove the points preview

            boardUpdate();

            setCanvasCursor(x, y);

            canvas.doubleTap = false;
        } else if (tile && locked) {
            // lookup is performed on mouse up, but we need to register mouse down on correct letter type first
            canvas.lookingUp = true;
            canvas.doubleTap = false;
        }

        return; // don't bother checking anything else
    }

    // if the mouse is over the shuffle button
    if (overListCategories.includes("shuffleButton")) {
        canvas.bankShuffleButton.clicking = true;
        canvas.doubleTap = false;
        return;
    }
}

// update position of tile when mouse moves during drag
function handleCanvasMouseMove(e) {
    e.preventDefault();

	// determine whether it is the current user's turn
	// const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    
    // get the pixel position of the mouse/finger
    let x, y;
    if (e.type === 'touchmove') {
        x = e.changedTouches[0].clientX - this.getBoundingClientRect().left;
        y = e.changedTouches[0].clientY - this.getBoundingClientRect().top;
    } else {
        x = e.offsetX;
        y = e.offsetY;
    }

    // update position of dragged tile
    if (dragged?.pixelX && dragged?.pixelY) {
        dragged.pixelX = x;
        dragged.pixelY = y;
    }

    // add new position to position history if changed
    if (dragged?.posHistory) {
        const lastPos = dragged.posHistory[dragged.posHistory.length - 1];
        if (lastPos.x !== x || lastPos.y !== y) {
            dragged.posHistory.push({x, y});
        }
    }

    // set the mouse cursor type and the expanded drop zones
    const overList = e.type === 'touchmove' ? whatMouseIsOver(x, y) : setCanvasCursor(x, y);
    const overListCategories = getPropArray(overList, "category");

    canvas.overList = overList; // store this for use in places that may not have access to the mouse cursor

    if (dragged && overListCategories.includes("bankDropZone")) {
        let dropZone = overList[overListCategories.indexOf("bankDropZone")].zoneIndex;
        setExpandedDropZone(dropZone);
    } else if (dragged) {
        setExpandedDropZone(undefined);
    }
}

function handleDocumentMouseUp(e) {
	// determine whether it is the current user's turn
	// const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    
    // cancel if a popup is open
    if (visiblePopups.length > 0) return;

    // get the pixel position of the mouse/finger
    let x, y, clientX, clientY;
    if (e.type === 'touchend') {
        x = e.changedTouches[0].clientX - canvas.c.getBoundingClientRect().left;
        y = e.changedTouches[0].clientY - canvas.c.getBoundingClientRect().top;
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        x = e.offsetX;
        y = e.offsetY;
        clientX = e.clientX;
        clientY = e.clientY;
    }


    const overList = whatMouseIsOver(x, y);
    const overListCategories = getPropArray(overList, "category");

    // check for the shuffle button
    if (!dragged && overListCategories.includes("shuffleButton") && canvas.bankShuffleButton.clicking && !canvas.bankShuffleButton.cooldown) {
        shuffleBank();
        canvas.doubleTap = false;
    }
    canvas.bankShuffleButton.clicking = false;
    if (e.type === 'touchend') canvas.bankShuffleButton.hover = false;
    
    // do the word lookup
    if (!dragged && overListCategories.includes("board")) {
        const overObj = overList[overListCategories.indexOf("board")];

        if (canvas.lookingUp && overObj.tile?.locked) {
            lookup(overObj.x, overObj.y, clientX, clientY);
            canvas.lookingUp = false;
            return;
        };
    }
    canvas.lookingUp = false;

    if (!dragged) return; // from here on we will assume that a letter is being dragged

    // determine whether the tile has moved since touchdown (otherwise it has just been clicked)
    const stayedStill = dragged?.posHistory?.length === 1;

    const onBoard = overListCategories.includes("board");

    let overObj;
    if (onBoard) {
        overObj = overList[overListCategories.indexOf("board")];
    }

    const onExistingTile = onBoard && overObj?.tile;

    let sendPointsRequest = true;

    // only if the letter was moved to a free space on the board
    if (onBoard && !onExistingTile && !stayedStill && !game.inactive) {
        addLetter(overObj.x, overObj.y, dragged.bankIndex, dragged.letter); // add the letter to the appropriate spot on the board
    } else { // if the letter was dropped anywhere else or stayed still

        if (overListCategories.includes("bankDropZone")) {
            const overObj = overList[overListCategories.indexOf("bankDropZone")];

            const from = canvas.bankOrder.indexOf(dragged.bankIndex);
            const to = canvas.dropZones[overObj.zoneIndex].orderIndex;

            moveBankLetter(from, to);
        }

        // if there is already a points preview, show it
        if (canvas.pointsPreview) {
            canvas.pointsPreview.hidden = false;
            sendPointsRequest = false;
        }

        canvas.bank[dragged.bankIndex].hidden = false; // show the letter in the bank
        
        clearDropZoneGaps();
    }

    // show the points preview
    if (sendPointsRequest) checkPoints();
    
    dragged = undefined; // remove the dragged tile
}

function handleDocumentKeyPress(e) {
    if (!canvas.overList) return;

    const overItem = canvas.overList.find(a => a.category === 'board');
    if (!overItem) return;
    if (overItem.tile && overItem.tile.locked) return;

    const letter = e.key.toUpperCase();
    if (!["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].includes(letter)) return;

    const bankItem = canvas.bank.find(a => a.letter.toUpperCase() === letter && a.hidden === false);
    if (!bankItem) return;


    // at this point we know that we can add the letter to the board
    // it is now all about where we want to place it
    // if the space is empty, place it there
    // otherwise, try to place it forwards

    let xAmount = 0;
    let yAmount = 0;

    if (overItem.tile) {
        const tx = overItem.tile.x;
        const ty = overItem.tile.y;

        const blockedBelow = game.board[ty + 1]?.[tx]?.locked;
        const blockedRight = game.board[ty]?.[tx + 1]?.locked;

        const emptyAbove = !game.board[ty - 1][tx];
        const emptyLeft = !game.board[ty][tx - 1];

        if (!emptyLeft && !blockedRight) {
            // scan to the right
            let next = game.board[ty][tx + xAmount];
            while (tx + xAmount < 14 && (next)) {
                xAmount += 1;
                next = game.board[ty][tx + xAmount];
            }
        } else if (!emptyAbove && !blockedBelow) {
            // scan downwards
            let next = game.board[ty + yAmount]?.[tx];
            while (ty + yAmount < 14 && (next)) {
                yAmount += 1;
                next = game.board[ty + yAmount]?.[tx];
            }
        }
    }

    const tile = game.board[overItem.y + yAmount][overItem.x + xAmount];

    // show the letter that used to be there back in the bank
    if (tile) {
        canvas.bank.find(a => a.bankIndex === tile.bankIndex).hidden = false;
    }

    // hide the letter from the canvas bank
    canvas.bank.find(a => a.bankIndex === bankItem.bankIndex).hidden = true;

    // add the letter to the board
    const newTile = addLetter(overItem.x + xAmount, overItem.y + yAmount, bankItem.bankIndex, letter);

    // store the tile in the overItem if we are still at zero offset
    if (xAmount === 0 && yAmount === 0) {
        overItem.tile = newTile;
    }

    //checkPoints();
}