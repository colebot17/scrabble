function addHandlers() {
    const canvas = document.getElementById("scrabbleCanvas");
    canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    canvas.addEventListener("pointermove", handleCanvasPointerMove);
    document.addEventListener("pointerup", handleDocumentPointerUp);

    document.addEventListener("pointerleave", removePointer);
    document.addEventListener("pointercancel", removePointer);

    canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", e => e.preventDefault(), { passive: false });

    document.addEventListener("keydown", handleDocumentKeyDown);
}
function removeHandlers() {
    const canvas = document.getElementById("scrabbleCanvas");
    canvas.removeEventListener("pointerdown", handleCanvasPointerDown);
    canvas.removeEventListener("pointermove", handleCanvasPointerMove);
    document.removeEventListener("pointerup", handleDocumentPointerUp);

    document.removeEventListener("pointerleave", removePointer);
    document.removeEventListener("pointercancel", removePointer);

    document.removeEventListener("keydown", handleDocumentKeyDown);
}

function handleCanvasDblClick() {
    if (!dragged) clearBoard();
}

// handle drag start on canvas
function handleCanvasPointerDown(e) {
    
    // maybe don't do this if pinching to zoom?
    e.preventDefault();

    // close the letter picker
    document.getElementById("letterPicker")?.blur();

    // cancel if a popup is open
    if (visiblePopups.length > 0) return;

    // get the position of the pointer
    const pixScale = getScale();
    const x = e.offsetX * pixScale;
    const y = e.offsetY * pixScale;
    const ident = e.pointerId;

    // check for and set double-click
    if (canvas.dblClick && !canvas.ptrs.get(canvas.dblClick)?.down) {
        handleCanvasDblClick();
        return;
    }
    canvas.dblClick = ident;
    setTimeout(() => canvas.dblClick = false, 500);

    // get what the mouse is over
    const overList = whatMouseIsOver(x, y);
    const overListCategories = getPropArray(overList, "category");

    let pickUp;

    // if the mouse is over a bank letter
    if (overListCategories.includes("bankLetter") && !game.inactive) {
        // then pick it up

        const overObj = overList[overListCategories.indexOf("bankLetter")];
        const orderIndex = overObj.orderIndex;
        const canvasLetter = canvas.bank[canvas.bankOrder[orderIndex]];

        pickUp = {
            bankIndex: canvasLetter.bankIndex,
            blank: !canvasLetter.letter,
            letter: canvasLetter.letter,
            mouseOffset: {
                x: -overObj.xNorm * squareWidth,
                y: -overObj.yNorm * squareWidth
            },
            from: "bank"
        };

        // hide the letter from the bank and add a gap where the letter used to be
        canvasLetter.hidden = true;
        const zoneIndex = canvas.dropZones.findIndex(a => a.orderIndex === orderIndex);
        setDropZoneExpanded(zoneIndex, true, false);

        // temporarily hide the points preview
        canvas.pointsPreview.hidden = true;

        // don't count for double tap
        canvas.dblClick = false;

    // if the mouse is over the board
    } else if (overListCategories.includes("board")) {
        const overObj = overList[overListCategories.indexOf("board")];

        const tile = overObj.tile;
        if (tile) {

            // initialize the drag if the tile is unlocked
            if (!tile.locked && !game.inactive) {
                pickUp = {
                    bankIndex: tile.bankIndex,
                    blank: tile.blank,
                    letter: tile.letter,
                    mouseOffset: {
                        x: overObj.x * (squareWidth + SQUARE_GAP) - x,
                        y: overObj.y * (squareWidth + SQUARE_GAP) - y
                    },
                    from: "board"
                };

                game.board[overObj.y][overObj.x] = null; // remove the tile from the board

                canvas.pointsPreview = false; // remove the points preview

                boardUpdate();
            }

            canvas.dblClick = false;

        }

    } else if (overListCategories.includes("shuffleButton")) {
        canvas.bankShuffleButton.clicking = true;
        canvas.dblClick = false;
    }

    // update the pointer map
    const ptr = {
        down: true,
        x, y, overList,
        dragging: pickUp,
        downOverList: overList,
        downTime: performance.now()
    };
    if (!canvas.ptrs) canvas.ptrs = new Map();
    canvas.ptrs.set(ident, ptr);

    if (e.pointerType === "mouse") {
        setCanvasCursor(ptr);
        canvas.overList = overList;
    }
    updateDarkenedSquares(canvas.ptrs);
}

// update position of tile when pointer moves during drag
function handleCanvasPointerMove(e) {

    // get the position of the pointer
    const pixScale = getScale();
    const x = e.offsetX * pixScale;
    const y = e.offsetY * pixScale;
    const overList = whatMouseIsOver(x, y);
    const down = e.buttons !== 0;
    const ident = e.pointerId;

    // add the pointer if it hasn't been registered yet
    if (!canvas.ptrs?.has(ident)) {
        const ptr = {
            down, x, y, overList,
            downOverList: down ? overList : undefined,
            downTime: down ? performance.now() : undefined
        };
        if (!canvas.ptrs) canvas.ptrs = new Map();
        canvas.ptrs.set(ident, ptr);
    }

    const ptr = canvas.ptrs.get(ident);

    // update the pointer's position info
    ptr.x = x;
    ptr.y = y;
    ptr.overList = overList;

    // perform canvas updates
    if (e.pointerType === "mouse") {
        setCanvasCursor(ptr);
        canvas.overList = overList;
    }
    updateDarkenedTiles(canvas.ptrs);
    updateDarkenedSquares(canvas.ptrs);
    updateShuffleButtonHover(canvas.ptrs);
    updateExpandedDropZones(canvas.ptrs);
}

function handleDocumentPointerUp(e) {

    // get the position of the pointer
    const pixScale = getScale();
    const x = e.offsetX * pixScale;
    const y = e.offsetY * pixScale;
    const ident = e.pointerId;

    const overList = whatMouseIsOver(x, y);

    const ptr = canvas.ptrs?.get(ident);
    if (!ptr) return;

    // update the pointer's position info
    ptr.x = x;
    ptr.y = y;
    ptr.overList = overList;

    if (!ptr?.down) return; // idk how there would be a pointer that's not down but just in case

    // handle the shuffle button
    const sb = canvas.bankShuffleButton;
    const wasOverSB = ptr.downOverList.some(a => a.category === "shuffleButton");
    const isOverSB = overList.some(a => a.category === "shuffleButton");
    if (sb && !sb.cooldown && wasOverSB) {
        if (!ptr.dragging && isOverSB) {
            shuffleBank();
            canvas.dblClick = false;
        }
        sb.clicking = false;
    }

    // do the word lookup if appropriate
    const didStartOnLockedTile = ptr.downOverList?.some(a => a.category === "board" && a?.tile?.locked);
    const finalOverObjLocked = overList.find(a => a.category === "board" && a.tile?.locked);
    if (!ptr.dragging && didStartOnLockedTile && finalOverObjLocked) {
        lookup(finalOverObjLocked.x, finalOverObjLocked.y, e.clientX, e.clientY);
    }

    if (ptr.dragging) {
        // determine whether the tile has been clicked quickly enough to warrant removal
        const holdTime = performance.now() - (ptr.downTime || 0);
        const fastEnoughToRemove = holdTime <= 175;

        // get a new overList for the center of the dragged tile
        const tileCenterX = ptr.x + (ptr.dragging.mouseOffset?.x + squareWidth / 2 || 0);
        const tileCenterY = ptr.y + (ptr.dragging.mouseOffset?.y + squareWidth / 2 || 0);
        const tileOverList = whatMouseIsOver(tileCenterX, tileCenterY);

        const tileBoardOverObj = tileOverList.find(a => a.category === "board");
        const onExistingTile = tileBoardOverObj?.tile;

        let calculatePoints = true;

        const accOnCanvas = e.target === canvas.c;

        // only if the letter was moved to a free space on the board
        if (accOnCanvas && tileBoardOverObj && !onExistingTile && !fastEnoughToRemove && !game.inactive) {
            
            // add the letter to the appropriate spot on the board
            const snapFromX = ptr.x + (ptr.dragging.mouseOffset?.x || -squareWidth / 2);
            const snapFromY = ptr.y + (ptr.dragging.mouseOffset?.y || -squareWidth / 2);
            addLetter(
                tileBoardOverObj.x, tileBoardOverObj.y,
                ptr.dragging.bankIndex, ptr.dragging.letter,
                snapFromX, snapFromY
            );

        } else { // if the letter was dropped anywhere else or was clicked quickly, remove it

            // return it to the bank (to the new position if dropped into the bank)
            if (accOnCanvas) {
                const dropZoneOverObj = tileOverList.find(a => a.category === "bankDropZone");
                if (dropZoneOverObj) {
                    returnToBank(ptr.dragging, ptr.x, ptr.y, canvas.dropZones[dropZoneOverObj.zoneIndex].orderIndex);
                } else {
                    returnToBank(ptr.dragging, ptr.x, ptr.y);
                }
            } else {
                returnToBank(ptr.dragging);
            }

            // if there is already a points preview, show it
            if (canvas.pointsPreview) {
                canvas.pointsPreview.hidden = false;
                canvas.pointsPreview.grow = new Anim(REGION_GROW_DURATION, { delay: SNAP_FROM_DURATION });
                calculatePoints = false;
            }
        }

        // show the points preview
        if (calculatePoints) checkPoints();

        ptr.dragging = undefined; // remove the dragged tile
    }

    ptr.down = false;
    ptr.downTime = undefined;
    ptr.downOverList = undefined;

    if (e.pointerType === "mouse") {
        setCanvasCursor(ptr);
        canvas.overList = overList;
    }
    updateDarkenedTiles(canvas.ptrs);
    updateDarkenedSquares(canvas.ptrs);
    updateShuffleButtonHover(canvas.ptrs);

    if (e.pointerType === "touch" || (e.pointerType === "pen" && e.pressure === 0)) removePointer(e);
}

function removePointer(e) {
    const pixScale = getScale();
    const x = e.offsetX * pixScale;
    const y = e.offsetY * pixScale;
    const ident = e.pointerId;

    // if still dragging a tile, put it back in the bank
    const ptr = canvas.ptrs.get(ident);
    if (ptr?.dragging) {
        // return it to the bank
        returnToBank(ptr.dragging, x, y);

        // show the points preview (either by unhiding or calculating)
        if (canvas.pointsPreview) {
            canvas.pointsPreview.hidden = false;
            canvas.pointsPreview.grow = new Anim(REGION_GROW_DURATION, { delay: SNAP_FROM_DURATION });
        } else {
            checkPoints();
        }
        
        ptr.dragging = undefined;
    }

    // no longer track this pointer
    canvas.ptrs.delete(ident);

    updateDarkenedTiles(canvas.ptrs);
    updateDarkenedSquares(canvas.ptrs);
    updateShuffleButtonHover(canvas.ptrs);
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