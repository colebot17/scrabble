const DROP_ZONE_ANIMATION_TIME = 50;

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

    // clear the draft
    removeDraft();

    // disable the move button
    setMoveButtonEnablementTo(false);

    boardUpdate();
}

function boardUpdate() {
    // called when tiles on board change in any way
    updateMoveHistory();
}

/**
 * Enables or disables the move button. Does not check whether the button should or should not be enabled.
 * @param {boolean} enableButton whether to enable the button
 */
function setMoveButtonEnablementTo(enableButton) {
    const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    if (!userTurn) return;
    // the move button will be disabled no matter what when it is not the current user's turn
    // the enablement of the move button when it isn't the user's turn is controlled by setOOTD() in script.js
    
    const moveButton = document.getElementById('makeMoveButton');
    if (enableButton) {
        moveButton.disabled = false;
        moveButton.title = "";
    } else {
        moveButton.disabled = true;
        moveButton.title = "You must form a valid word to make your move.";
    }
}

function whatMouseIsOver(x, y) {
    // x and y are pixel values offset from the canvas

    // this function will return the general category(ies) that the mouse is over, with more specific details for some categories
    // the mouse can be over multiple things at once!

    // things the mouse could be over: board, shuffleButton, bankLetter, bankDropZone
    // {category: "board", x: 12, y: 7, tile: Tile}
    // {category: "shuffleButton"}
    // {category: "bankLetter", orderIndex: 1}
    // {category: "bankDropZone", zoneIndex: 1}

    // the function returns an array of each of these objects that is applicable

    
    const overList = [];

    // check the board
    const boardX = Math.floor(x / (squareWidth + SQUARE_GAP));
    const boardY = Math.floor(y / (squareWidth + SQUARE_GAP));

    if (boardX.isBetween(0, 14, true) && boardY.isBetween(0, 14, true)) {
        overList.push({category: "board", x: boardX, y: boardY, tile: game.board[boardY][boardX]});
    }

    // check the shuffle button
    const xInShuffleBtnArea = x.isBetween(canvas.bankShuffleButton.position.start.x, canvas.bankShuffleButton.position.end.x);
    const yInShuffleBtnArea = y.isBetween(canvas.bankShuffleButton.position.start.y, canvas.bankShuffleButton.position.end.y);
    if (xInShuffleBtnArea && yInShuffleBtnArea && !game.inactive) {
        overList.push({category: "shuffleButton"});
    }

    // check the bank letters
    for (let i = 0; i < canvas.bankOrder.length; i++) {
        const canvasLetter = canvas.bank[canvas.bankOrder[i]];

        if (canvasLetter.hidden) continue;

        const xMatch = x.isBetween(canvasLetter.position.x, canvasLetter.position.x + canvas.bankTileWidth);
        const yMatch = y.isBetween(canvasLetter.position.y, canvasLetter.position.y + canvas.bankTileWidth);
        if (xMatch && yMatch) {
            overList.push({category: "bankLetter", orderIndex: i});
        }
    }

    // check the bank drop zones
    for (let i = 0; i < canvas.dropZones.length; i++) {
        const zone = canvas.dropZones[i];
        const inZone = x.isBetween(zone.start.x, zone.end.x) && y.isBetween(zone.start.y, zone.end.y);
        if (inZone) {
            overList.push({category: "bankDropZone", zoneIndex: i});
        }
    }

    return overList;
}

function setCanvasCursor(x, y) {
    const overList = whatMouseIsOver(x, y);
    const overObj = overList[0];

    if (!overObj) {
        canvas.c.style.cursor = 'default';
        canvas.bankShuffleButton.hover = false;
        return overList;
    }

    // if the mouse isn't over anything, it should have a regular cursor
    let cursor = 'default';

    // the cursor will be different depending on whether a tile is being dragged
    if (dragged) {
        cursor = 'grabbing';

        if (overObj.category === "board" && overObj.tile?.locked) {
            cursor = 'no-drop';
        }
    } else {
        if (overObj.category === "board") {
            if (overObj.tile) {
                if (overObj.tile.locked) {
                    cursor = 'pointer';
                } else {
                    cursor = (game.inactive ? 'not-allowed' : 'grab');
                }
            }
        }

        if (overObj.category === "shuffleButton") {
            cursor = 'pointer';
            canvas.bankShuffleButton.hover = true;
        } else {
            canvas.bankShuffleButton.hover = false;
        }

        if (overObj.category === "bankLetter") {
            cursor = (game.inactive ? 'not-allowed' : 'grab');
        }
    }

    canvas.c.style.cursor = cursor;

    return overList;
}

function setExpandedDropZone(zoneIndex) {
    // this function is also responsible for checking if the expanded drop zone has changed since last time

    const dropZoneChanged = zoneIndex != canvas.expandedDropZone;
    if (!dropZoneChanged) return;

    // if there actually is a drop zone to be expanded
    if (typeof zoneIndex === "number") {
        animateDropZone(zoneIndex, 1);
    }

    // collapse the old drop zone
    if (typeof canvas.expandedDropZone === "number") {
        animateDropZone(canvas.expandedDropZone, 0);
    }

    canvas.expandedDropZone = zoneIndex;
}

// raw function - be careful
function animateDropZone(zoneIndex, value) {
    if (zoneIndex == 0) {
        canvas.gapBeforeBankAnimation = new Animation(DROP_ZONE_ANIMATION_TIME, 0, canvas.extraGapBeforeBank, value);
    } else {
        const expandZone = canvas.bank[canvas.bankOrder[canvas.dropZones[zoneIndex].orderIndex - 1]]
        expandZone.gapAnimation = new Animation(DROP_ZONE_ANIMATION_TIME, 0, expandZone.extraGapAfter, value);
    }
}

function clearDropZoneGaps() {
    canvas.gapBeforeBankAnimation = undefined;
    canvas.extraGapBeforeBank = 0;

    for (let i = 0; i < canvas.bank.length; i++) {
        const current = canvas.bank[i];
        current.gapAnimation = undefined;
        current.extraGapAfter = 0;
    }
}