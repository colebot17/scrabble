function returnToBank(tile, toBankPos) {
    if (tile.locked || typeof tile.bankIndex !== "number") return;

    let bankPos = canvas.bankOrder.indexOf(tile.bankIndex);

    // move the bank letter to the correct spot if needed
    if (typeof toBankPos === "number") {
        moveBankLetter(bankPos, toBankPos);
        bankPos = toBankPos;
    }

    // gather information
    const bankLetter = canvas.bank[tile.bankIndex];
    const zone = canvas.dropZones.find(a => a.orderIndex === bankPos);
    const zoneExp = zone?.expansion;
    const expansionAmt = typeof zoneExp === "boolean" ? (zoneExp ? 1 : 0) : zoneExp?.getFrame() || 0;

    // set up snapFrom animation
    const { x, y } = getPixelPos(tile);
    bankLetter.snapFrom = { // animate into place
        x, y, w: expansionAmt,
        anim: new Anim(SNAP_FROM_DURATION, 0, 0, 1, "restrict", () => bankLetter.snapFrom = undefined)
    }

    // clear the gap in front of the letter
    if (zone) zone.expansion = false;

    // show the letter in the bank
    bankLetter.hidden = false;
}

function clearBoard() {
    // return all unlocked tiles to the bank
    for (let y in game.board) {
        for (let x in game.board) {
            if (game.board?.[y]?.[x] && !game.board[y][x].locked) {
                returnToBank(game.board[y][x]);
                game.board[y][x] = null;
            }
        }
    }

    // remove points preview
    canvas.pointsPreview = false;

    // disable the move button
    setMoveButtonEnablementTo(false);

    boardUpdate();
}

// called after tiles on board change in any way
function boardUpdate() {
    updateDraft();
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
    // the mouse can be over multiple things at once! (i.e. over a bank letter and a bank drop zone)

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

function setCanvasCursor(overList) {
    // change the overList to use the tile's center if dragging a tile
    if (dragged) {
        const tileCenterX = dragged.pixelX + (dragged.mouseOffset?.x + squareWidth / 2 || 0);
        const tileCenterY = dragged.pixelY + (dragged.mouseOffset?.y + squareWidth / 2 || 0);
        overList = whatMouseIsOver(tileCenterX, tileCenterY);
    }
    const overObj = overList[0];

    if (!overObj) {
        canvas.c.style.cursor = 'default';
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
        }

        if (overObj.category === "bankLetter") {
            cursor = (game.inactive ? 'not-allowed' : 'grab');
        }
    }

    canvas.c.style.cursor = cursor;
}

// given an overList, update canvas.darkenedTiles to darken hovered words
function updateDarkenedTiles(overList) {
    const boardOverObj = overList.find(a => a.category === "board");
    const darkenTiles = [];
    if (!dragged) {
        if (boardOverObj && boardOverObj.tile?.locked) {
            let sweepX = boardOverObj.x;
            let sweepY = boardOverObj.y;

            // sweep down
            while (sweepY < 15 && game.board[sweepY][sweepX]) {
                darkenTiles.push({ x: sweepX, y: sweepY });
                sweepY++;
            }
            sweepY = boardOverObj.y;

            // sweep up
            while (sweepY >= 0 && game.board[sweepY][sweepX]) {
                darkenTiles.push({ x: sweepX, y: sweepY });
                sweepY--;
            }
            sweepY = boardOverObj.y;
            
            // sweep right
            while (sweepX < 15 && game.board[sweepY][sweepX]) {
                darkenTiles.push({ x: sweepX, y: sweepY });
                sweepX++;
            }
            sweepX = boardOverObj.x;

            // sweep left
            while (sweepX >= 0 && game.board[sweepY][sweepX]) {
                darkenTiles.push({ x: sweepX, y: sweepY });
                sweepX--;
            }
            sweepX = boardOverObj.x;
        } else if (boardOverObj && !boardOverObj.tile?.locked) {
            darkenTiles.push({ x: boardOverObj.x, y: boardOverObj.y });
        }
    }
    
    // fade out all tiles no longer to remain darkened
    if (canvas.darkenTiles) {
        for (let darkenTile of canvas.darkenTiles) {
            // if the tile is no longer to remain darkened
            if (!darkenTiles.some(a => a.x == darkenTile.x && a.y == darkenTile.y) && !darkenTile.fade) {
                // set up the animation to fade it out
                darkenTile.fade = new Anim(
                    HOVER_FADE_OUT_DURATION, 0, 1, 0, "restrict",
                    () => canvas.darkenTiles.splice(canvas.darkenTiles.indexOf(darkenTile), 1)
                );
            }
        }
    }

    // add all newly darkend tiles
    for (let darkenTile of darkenTiles) {
        if (!canvas.darkenTiles) canvas.darkenTiles = [];
        let t = canvas.darkenTiles.find(a => a.x == darkenTile.x && a.y == darkenTile.y)
        if (t?.fade) {
            t.fade = undefined;
        } else if (!t) {
            canvas.darkenTiles.push(darkenTile);
        }
    }
}

function updateBankShuffleButton(overList) {
    const isOverShuffleButton = overList.some(a => a.category === "shuffleButton");

    if (isOverShuffleButton && !dragged) {
        canvas.bankShuffleButton.hover = true;
        canvas.bankShuffleButton.hoverFade = undefined;
    } else if (canvas.bankShuffleButton.hover) {
        canvas.bankShuffleButton.hover = false;
        canvas.bankShuffleButton.hoverFade = new Anim(
            HOVER_FADE_OUT_DURATION, 0, 1, 0, "restrict",
            () => canvas.bankShuffleButton.hoverFade = undefined
        );
    }
}

function setExpandedDropZones(zoneIndicies, animate = true) {
    for (let i = 0; i < canvas.dropZones.length; i++) {
        setDropZoneExpanded(i, zoneIndicies.includes(i), animate);
    }
}

function setDropZoneExpanded(zoneIndex, expanded = true, animate = true) {
    const zone = canvas.dropZones[zoneIndex];
    if (!zone) return;

    if (animate) {
        const currAmt = zone.expansion ? (typeof zone.expansion === "boolean" ? 1 : zone.expansion.getFrame()) : 0;
        const currDestAmt = zone.expansion ? (typeof zone.expansion === "boolean" ? 1 : zone.expansion.end) : 0;
        const destAmt = expanded ? 1 : 0;
        if (destAmt === currDestAmt) return;
        
        const distanceToGo = Math.abs(destAmt - currAmt);
        const time = DROP_ZONE_ANIMATION_TIME * distanceToGo;
        zone.expansion = new Anim(time, 0, currAmt, destAmt, "restrict", () => zone.expansion = !!expanded);
    } else {
        zone.expansion = !!expanded;
    }
}

function clearDropZoneGaps() {
    for (let i = 0; i < canvas.dropZones.length; i++) {
        canvas.dropZones[i].expansion = false;
    }
}