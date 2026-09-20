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
    const isTouchEvent = e.type === "touchstart";

    // block default actions unless there are multiple touches
    // (the user is probably trying to zoom in)
    // don't let them zoom in when they're dragging a tile
    if (!isTouchEvent || e.touches.length <= 1 || dragged) e.preventDefault();

    // close the letter picker
    document.getElementById("letterPicker")?.blur();

    // cancel if a popup is open
    if (visiblePopups.length > 0) return;

    // check for double-tap
    if (isTouchEvent) {
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
    if (isTouchEvent) {
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

        // pick up the letter

        const orderIndex = overObj.orderIndex;
        const canvasLetter = canvas.bank[canvas.bankOrder[orderIndex]];

        // update the dragged piece
        dragged = {
            bankIndex: canvasLetter.bankIndex,
            blank: !canvasLetter.letter,
            letter: canvasLetter.letter,
            mouseOffset: {
                x: -overObj.xNorm * squareWidth,
                y: -overObj.yNorm * squareWidth
            },
            pixelX: x,
            pixelY: y,
            touchIdentifier
        };
        canvasLetter.hidden = true; // hide the letter from the bank

        // add a gap where the letter used to be
        const zoneIndex = canvas.dropZones.findIndex(a => a.orderIndex === orderIndex);
        setDropZoneExpanded(zoneIndex, true, false);

        // temporarily hide the points preview
        canvas.pointsPreview.hidden = true;

        // don't count for double tap
        canvas.doubleTap = false;

    // if the mouse is over the board
    } else if (overListCategories.includes("board")) {
        const overObj = overList[overListCategories.indexOf("board")];

        const tile = overObj.tile;
        if (tile) {

            // initialize the drag if the tile is unlocked
            if (!tile.locked && !game.inactive) {
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

                updateDarkenedSquares(dragged);

                boardUpdate();
            } else if (tile.locked) {
                // lookup is performed on mouse up, but we need to register mouse down on correct letter type first
                canvas.lookingUp = true;
            }

            canvas.doubleTap = false;

        }

    } else if (overListCategories.includes("shuffleButton")) {

        canvas.bankShuffleButton.clicking = true;
        canvas.bankShuffleButton.touchIdentifier = touchIdentifier;

        canvas.doubleTap = false;

    }

    setCanvasCursor(overList);
}

// update position of tile when mouse moves during drag
function handleCanvasMouseMove(e) {
    const isTouchEvent = e.type === "touchmove";

    // block default actions unless there are multiple touches
    // (the user is probably trying to zoom in)
    // don't let them zoom in when they're dragging a tile
    if (!isTouchEvent || e.touches.length <= 1 || dragged) e.preventDefault();

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
    const overList = whatMouseIsOver(x, y);
    const overListCategories = getPropArray(overList, "category");
    canvas.overList = overList; // store this for use in places that may not have access to the mouse cursor

    setCanvasCursor(overList);

    // determine which tiles should be darkened
    updateDarkenedTiles(overList);
    updateDarkenedSquares(dragged);
    updateBankShuffleButton(overList);

    if (dragged && overListCategories.includes("bankDropZone")) {
        let dropZoneIndex = overList[overListCategories.indexOf("bankDropZone")].zoneIndex;
        setExpandedDropZones([ dropZoneIndex ]);
    } else {
        setExpandedDropZones([ ]);
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

    if (dragged) {

        // make sure the touch identifier matches
        if (e.type === 'touchend' && dragged.touchIdentifier >= 0 && dragged.touchIdentifier !== e.changedTouches[0].identifier) return;

        // determine whether the tile has moved since touchdown (otherwise it has just been clicked)
        const stayedStill = dragged?.posHistory?.length === 1;

        // get a new overList for the center of the dragged tile
        const tileCenterX = dragged.pixelX + (dragged.mouseOffset?.x + squareWidth / 2 || 0);
        const tileCenterY = dragged.pixelY + (dragged.mouseOffset?.y + squareWidth / 2 || 0);
        const tileOverList = whatMouseIsOver(tileCenterX, tileCenterY);
        const tileOverListCategories = getPropArray(tileOverList, "category");

        const onBoard = tileOverListCategories.includes("board");
        const tileBoardOverObj = tileOverList[tileOverListCategories.indexOf("board")];
        const onExistingTile = onBoard && tileBoardOverObj?.tile;

        let sendPointsRequest = true;

        const snapFromX = dragged.pixelX + (dragged.mouseOffset?.x || -squareWidth / 2);
        const snapFromY = dragged.pixelY + (dragged.mouseOffset?.y || -squareWidth / 2);

        // only if the letter was moved to a free space on the board
        if (onBoard && !onExistingTile && !stayedStill && !game.inactive) {
            // add the letter to the appropriate spot on the board
            addLetter(
                tileBoardOverObj.x, tileBoardOverObj.y,
                dragged.bankIndex, dragged.letter,
                snapFromX, snapFromY
            );
        } else { // if the letter was dropped anywhere else or stayed still, remove it

            // return it to the bank
            if (overListCategories.includes("bankDropZone")) {
                // move it to the new position if dropped in a bank drop zone
                const overObj = overList[overListCategories.indexOf("bankDropZone")];
                returnToBank(dragged, canvas.dropZones[overObj.zoneIndex].orderIndex);
            } else {
                returnToBank(dragged);
            }

            // if there is already a points preview, show it
            if (canvas.pointsPreview) {
                canvas.pointsPreview.hidden = false;
                canvas.pointsPreview.grow = new Anim(REGION_GROW_DURATION, { delay: SNAP_FROM_DURATION });
                sendPointsRequest = false;
            }
        }

        // show the points preview
        if (sendPointsRequest) checkPoints();

        dragged = undefined; // remove the dragged tile
    }

    setCanvasCursor(overList);
    updateDarkenedTiles(overList);
    updateDarkenedSquares(dragged);
    updateBankShuffleButton(overList);
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