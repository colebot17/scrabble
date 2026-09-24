function returnToBank(tile, px, py, toBankPos) {
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
    if ((typeof px === "number" && typeof py === "number") || (typeof tile.x === "number" && typeof tile.y === "number")) {
        const { x, y, scale } = getPixelPos(tile, px, py);
        bankLetter.snapFrom = { // animate into place
            x, y, scale, w: expansionAmt,
            anim: new Anim(SNAP_FROM_DURATION, { onComplete: () => bankLetter.snapFrom = undefined })
        }
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
            const xNorm = (x - canvasLetter.position.x) / canvas.bankTileWidth;
            const yNorm = (y - canvasLetter.position.y) / canvas.bankTileWidth;
            overList.push({category: "bankLetter", orderIndex: i, xNorm, yNorm });
        }
    }

    // check the bank drop zones
    for (let i = 0; i < canvas.dropZones?.length; i++) {
        const zone = canvas.dropZones[i];
        const inZone = x.isBetween(zone.start.x, zone.end.x) && y.isBetween(zone.start.y, zone.end.y);
        if (inZone) {
            overList.push({category: "bankDropZone", zoneIndex: i});
        }
    }

    return overList;
}

function setCanvasCursor(ptr) {
    // change the overList to use the tile's center if dragging a tile
    let overList;
    if (ptr.dragging) {
        const tileCenterX = ptr.x + (ptr.dragging.mouseOffset?.x + squareWidth / 2 || 0);
        const tileCenterY = ptr.y + (ptr.dragging.mouseOffset?.y + squareWidth / 2 || 0);
        overList = whatMouseIsOver(tileCenterX, tileCenterY);
    } else {
        overList = ptr.overList;
    }
    const overObj = overList?.[0];

    // if the mouse isn't over anything, it should have a regular cursor
    let cursor = "default";

    if (game.inactive) {
        if (overObj?.category === "board" && overObj.tile?.locked) {
            cursor = "pointer";
        }
    } else if (ptr.dragging) {
        if (overObj?.category === "board" && overObj.tile) {
            cursor = "no-drop";
        } else {
            cursor = "grabbing";
        }
    } else {
        switch (overObj?.category) {
            case "board":
                if (overObj.tile) cursor = overObj.tile.locked ? "pointer" : "grab";
                break;
            case "shuffleButton":
                cursor = "pointer";
                break;
            case "bankLetter":
                cursor = "grab";
                break;
        }
    }

    canvas.c.style.cursor = cursor;
}

// given an overList, update canvas.darkenedTiles to darken hovered words
function updateDarkenedTiles(ptrs) {

    // create a list of all tiles that should be darkened
    const darkenTiles = [];
    for (const ptr of ptrs.values()) {
        const boardOverObj = ptr.overList?.find(a => a.category === "board");
        if (ptr.dragging || !boardOverObj) continue;

        if (boardOverObj.tile?.locked) {

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

        } else {

            darkenTiles.push({ x: boardOverObj.x, y: boardOverObj.y });

        }
    }

    // based on that list, update the actual darkened tiles to match (and animate)
    
    // fade out all tiles no longer to remain darkened
    for (const alrDarkTile of canvas.darkenTiles ?? []) {
        const shouldStayDark = darkenTiles.some(a => a.x === alrDarkTile.x && a.y === alrDarkTile.y);
        const alreadyFadingOut = !!alrDarkTile.fade;
        if (shouldStayDark || alreadyFadingOut) continue;

        // set up the animation to fade it out
        alrDarkTile.fade = new Anim(HOVER_FADE_OUT_DURATION, {
            from: 1, to: 0,
            onComplete: () => canvas.darkenTiles.splice(canvas.darkenTiles.indexOf(alrDarkTile), 1)
        });
    }

    // add all newly darkend tiles
    for (let toDarken of darkenTiles) {
        if (!canvas.darkenTiles) canvas.darkenTiles = [];
        
        let alrDarkTile = canvas.darkenTiles.find(a => a.x == toDarken.x && a.y == toDarken.y);

        if (alrDarkTile?.fade) {
            alrDarkTile.fade = undefined;
        } else if (!alrDarkTile) {
            canvas.darkenTiles.push(toDarken);
        }
    }
}

function updateDarkenedSquares(ptrs) {
    const toBeDarkened = [];
    for (const ptr of ptrs.values()) {
        if (ptr.dragging) {
            const x = ptr.x + (ptr.dragging.mouseOffset?.x + squareWidth / 2 || 0);
            const y = ptr.y + (ptr.dragging.mouseOffset?.y + squareWidth / 2 || 0);
            const boardOverObj = whatMouseIsOver(x, y).find(a => a.category === "board");
            if (boardOverObj && !game.board[boardOverObj.y][boardOverObj.x]) {
                toBeDarkened.push({ x: boardOverObj.x, y: boardOverObj.y });
            }
        }
    }

    if (!canvas.darkenedSquares) canvas.darkenedSquares = [];

    for (const alrDarkSquare of canvas.darkenedSquares) {
        const stayDarkened = toBeDarkened.some(a => a.x === alrDarkSquare.x && a.y === alrDarkSquare.y);
        if (!alrDarkSquare.fade && !stayDarkened) {
            alrDarkSquare.fade = new Anim(HOVER_FADE_OUT_DURATION, {
                from: 1, to: 0,
                onComplete: () => canvas.darkenedSquares.splice(canvas.darkenedSquares.indexOf(alrDarkSquare), 1)
            });
        }
    }

    for (const tbdSquare of toBeDarkened) {
        const existing = canvas.darkenedSquares.find(a => a.x === tbdSquare.x && a.y === tbdSquare.y);
        if (existing) {
            existing.fade = undefined;
        } else {
            canvas.darkenedSquares.push(tbdSquare);
        }
    }
}

function updateShuffleButtonHover(ptrs) {
    const sb = canvas.bankShuffleButton;
    if (!sb) return;

    const isHovered = ptrs.values().some(a => !a.dragging && a.overList.some(b => b.category === "shuffleButton"));

    if (isHovered) {
        sb.hover = true;
        sb.hoverFade = undefined;
    } else if (sb.hover) {
        sb.hover = false;
        sb.hoverFade = new Anim(
            HOVER_FADE_OUT_DURATION, {
                from: 1, to: 0,
                onComplete: () => sb.hoverFade = undefined
            }
        );
    }
}

function updateExpandedDropZones(ptrs) {
    const expand = new Set();

    for (const ptr of ptrs.values()) {
        if (ptr.dragging) { // use the center of the tile if dragging
            const tileCenterX = ptr.x + (ptr.dragging.mouseOffset?.x + squareWidth / 2 || 0);
            const tileCenterY = ptr.y + (ptr.dragging.mouseOffset?.y + squareWidth / 2 || 0);
            const overList = whatMouseIsOver(tileCenterX, tileCenterY);

            const zoneOverObj = overList?.find(a => a.category === "bankDropZone");
            if (zoneOverObj) expand.add(zoneOverObj.zoneIndex);
        }
    }

    setExpandedDropZones(expand);
}

function setExpandedDropZones(zoneIndices, animate = true) {
    for (let i = 0; i < canvas.dropZones?.length; i++) {
        setDropZoneExpanded(i, zoneIndices.has(i), animate);
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
        zone.expansion = new Anim(time, {
            from: currAmt, to: destAmt,
            onComplete: () => zone.expansion = !!expanded
        });
    } else {
        zone.expansion = !!expanded;
    }
}

function clearDropZoneGaps() {
    for (let i = 0; i < canvas.dropZones.length; i++) {
        canvas.dropZones[i].expansion = false;
    }
}