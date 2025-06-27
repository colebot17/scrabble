function addHandlers() {
    const canvas = document.getElementById('scrabbleCanvas');

    canvas.addEventListener('dblclick', handleCanvasDblClick);

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('touchstart', handleCanvasMouseDown);

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('touchmove', handleCanvasMouseMove);

    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('touchend', handleDocumentMouseUp);

    document.addEventListener('keydown', handleDocumentKeyDown);
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

    document.removeEventListener('keydown', handleDocumentKeyDown);
}

// define constants
const dropZoneAnimationTime = 50;

function handleCanvasDblClick(e) { // EVENT OBJECT MAY NOT BE AVAILABLE
    if (!dragged) clearBoard();
}

// handle drag start on canvas
function handleCanvasMouseDown(e) {
    if (e.type === 'touchstart') {
        if (e.touches.length <= 1 || dragged) {
            e.preventDefault();
        }
    } else {
        e.preventDefault();
    }

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
    const pixScale = getScale();
    let x, y, clientX, clientY, touchIdentifier;
    if (e.type === 'touchstart') {
        x = (e.changedTouches[0].clientX - this.getBoundingClientRect().left) * pixScale;
        y = (e.changedTouches[0].clientY - this.getBoundingClientRect().top) * pixScale;
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
        touchIdentifier = e.changedTouches[0].identifier;
    } else {
        x = e.offsetX * pixScale;
        y = e.offsetY * pixScale;
        clientX = e.clientX;
        clientY = e.clientY;
        touchIdentifier = undefined;
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
            pixelY: y,
            touchIdentifier
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
                posHistory: [{ x, y }],
                touchIdentifier
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
        canvas.bankShuffleButton.touchIdentifier = touchIdentifier;

        canvas.doubleTap = false;

        return;
    }
}

// update position of tile when mouse moves during drag
function handleCanvasMouseMove(e) {

    if (e.type === 'touchmove') {
        if (e.touches.length <= 1 || dragged) {
            e.preventDefault();
        }
    } else {
        e.preventDefault();
    }

    // determine whether it is the current user's turn
    // const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

    // get the pixel position of the mouse/finger
    const pixScale = getScale();
    let x, y;
    if (e.type === 'touchmove') {
        let tIndex = 0;
        if (dragged?.touchIdentifier) {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === dragged.touchIdentifier) {
                    tIndex = i;
                    break;
                }
            }
        }

        x = (e.touches[tIndex].clientX - this.getBoundingClientRect().left) * pixScale;
        y = (e.touches[tIndex].clientY - this.getBoundingClientRect().top) * pixScale;
    } else {
        x = e.offsetX * pixScale;
        y = e.offsetY * pixScale;
    }

    if (dragged) {
        // update position of dragged tile
        dragged.pixelX = x;
        dragged.pixelY = y;

        // add new position to position history if changed
        if (!dragged.posHistory) dragged.posHistory = [];
        const lastPos = dragged.posHistory.at(-1);
        if (!lastPos || lastPos.x !== x || lastPos.y !== y) {
            dragged.posHistory.push({ x, y });
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
    const pixScale = getScale();
    let x, y, clientX, clientY, touchIdentifier;
    if (e.type === 'touchend') {
        x = (e.changedTouches[0].clientX - canvas.c.getBoundingClientRect().left) * pixScale;
        y = (e.changedTouches[0].clientY - canvas.c.getBoundingClientRect().top) * pixScale;
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
        touchIdentifier = e.changedTouches[0].identifier;
    } else {
        x = e.offsetX * pixScale;
        y = e.offsetY * pixScale;
        clientX = e.clientX;
        clientY = e.clientY;
        touchIdentifier = undefined;
    }


    const overList = whatMouseIsOver(x, y);
    const overListCategories = getPropArray(overList, "category");

    // check for the shuffle button

    if (canvas.bankShuffleButton.clicking && !canvas.bankShuffleButton.cooldown && canvas.bankShuffleButton.touchIdentifier === touchIdentifier) {
        const notDragFinger = dragged?.touchIdentifier !== touchIdentifier || (touchIdentifier == undefined && !dragged);
        if (notDragFinger && overListCategories.includes("shuffleButton")) {
            shuffleBank();
            canvas.doubleTap = false;
        }
        canvas.bankShuffleButton.clicking = false;
        if (e.type === 'touchend') canvas.bankShuffleButton.hover = false;
    }

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

    // make sure the touch identifier matches
    if (e.type === 'touchend' && dragged.touchIdentifier >= 0 && dragged.touchIdentifier !== e.changedTouches[0].identifier) return;

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
    } else { // if the letter was dropped anywhere else or stayed still, remove it

        // reorder the letter in the bank order
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

        // remove the draft if the board is empty
        if (getUnlockedTiles(game.board).length === 0) {
            removeDraft();
        }

        clearDropZoneGaps();
    }

    // show the points preview
    if (sendPointsRequest) checkPoints();

    dragged = undefined; // remove the dragged tile
}

function handleDocumentKeyDown(e) {
    if (document.activeElement !== document.body) return; // cancel if anything else is trying to accept text

    if (e.metaKey || e.altKey) return; // ignore if cmd/alt are pressed

    // we keep an up-to-date overList in the move handler because we can't get the mouse position from this event
    if (!canvas.overList) return;

    // make sure we're over the board
    const overItem = canvas.overList.find(a => a.category === 'board');
    if (!overItem) return;

    handleKeyPressOnTile(e.key, overItem.x, overItem.y, e.ctrlKey);
}

function getScale() {
    // we're doing this based on width
    // since we assume that the board is uniformly scaled, it shouldn't matter
    const virtualWidth = canvas.c.width;
    const actualWidth = canvas.c.getBoundingClientRect().width;

    return virtualWidth / actualWidth;
}