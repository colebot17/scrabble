function handleCanvasDblClick(e) { // EVENT OBJECT MAY NOT BE AVAILABLE
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
        canvas.bank[i].extraGapAfter = 0;
    }
    canvas.extraGapBeforeBank = 0;

    // remove points preview
    canvas.pointsPreview = false;
}

// handle drag start on canvas
function handleCanvasMouseDown(e) {
    e.preventDefault();

	// determine whether it is the current user's turn
	const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

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

    // if the game is active
    if (!game.inactive) {
        // loop through letter bank tile positions to see if user clicked on one
        for (let i in canvas.bankOrder) {
            const canvasLetter = canvas.bank[canvas.bankOrder[i]];

            // don't accept a click if the letter is hidden
            if (canvasLetter.hidden) continue;

            const xMatch = x > canvasLetter.position.x && x < canvasLetter.position.x + canvas.bankTileWidth;
            const yMatch = y > canvasLetter.position.y && y < canvasLetter.position.y + canvas.bankTileWidth;
            if (xMatch && yMatch) { // if this is the one that the user has clicked on
                // update the dragged piece
                dragged = {
                    bankIndex: canvasLetter.bankIndex,
                    blank: !canvasLetter.letter,
                    letter: canvasLetter.letter,
                    pixelX: x,
                    pixelY: y
                }
                canvasLetter.hidden = true; // hide the letter from the bank
                
                // add a gap where the letter used to be
                if (i == 0) {
                    canvas.extraGapBeforeBank = 1;
                } else {
                    canvas.bank[canvas.bankOrder[i - 1]].extraGapAfter = 1;
                }

                // temporarily hide the points preview
                canvas.pointsPreview.hidden = true;

                return; // don't bother to check the board
            }
        }
    }

    // check the board
    let boardX = Math.floor(x / (squareWidth + squareGap));
    let boardY = Math.floor(y / (squareWidth + squareGap));
    
    let tile = game.board?.[boardY]?.[boardX];
    let locked = tile?.locked;

    // initialize the drag if tile is unlocked
    if (tile && !locked && !game.inactive) {
        // when initializing a drag from a letter already on the board
        dragged = {
            bankIndex: tile.bankIndex,
            blank: tile.blank,
            letter: tile.letter,
            mouseOffset: {
                x: (boardX - (x / (squareWidth + squareGap))) * (squareWidth + squareGap),
                y: (boardY - (y / (squareWidth + squareGap))) * (squareWidth + squareGap)
            },
            pixelX: x,
            pixelY: y,
            posHistory: [{x, y}]
        }

        game.board[boardY][boardX] = null; // remove the tile from the board

        // hide the points preview
        canvas.pointsPreview = false;

        return; // nothing else to do
    }

    // shuffle the bank if the shuffle button is clicked
    // (but do a fancy thing with mousedown and mouseup)
    const xOnShuffle = x > canvas.bankShuffleButton.position.start.x && x < canvas.bankShuffleButton.position.end.x;
    const yOnShuffle = y > canvas.bankShuffleButton.position.start.y && y < canvas.bankShuffleButton.position.end.y;
    if (xOnShuffle && yOnShuffle) {
        canvas.bankShuffleButton.clicking = true;
        return;
    }

    if (tile && locked) {
        // show the word definition
        lookupWord(boardX, boardY, clientX, clientY);
    }
}

// update position of tile when mouse moves during drag
function handleCanvasMouseMove(e) {
    e.preventDefault();

	// determine whether it is the current user's turn
	const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    
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

    // if the mouse isn't over anything, it should have a regular cursor
    let cursor = 'default';

    const outOfTurn = (game.inactive || game.players[game.turn % game.players.length].id != account.id);

    // check the letter bank
    // get the canvas.bank without hidden items
    let bank = [];
    for (var i = 0; i < canvas.bank.length; i++) {
        if (!canvas.bank[i].hidden) {
            bank.push(canvas.bank[i]);
        }
    }

    // loop through letter bank tile positions to see if user is hovering over one
    for (let i in bank) {
        const xMatch = x > bank[i].position.x && x < bank[i].position.x + canvas.bankTileWidth;
        const yMatch = y > bank[i].position.y && y < bank[i].position.y + canvas.bankTileWidth;
        if (xMatch && yMatch) { // if this is the one that the user is hovering over
            cursor = (game.inactive ? 'not-allowed' : 'grab');
        }
    }
    
    // check the board
    let boardX = Math.floor(x / (squareWidth + squareGap));
    let boardY = Math.floor(y / (squareWidth + squareGap));
    
    let tile = game.board?.[boardY]?.[boardX];
    let locked = tile?.locked;

    if (tile) {
        if (locked) {
            cursor = 'pointer';
        } else {
            cursor = (game.inactive ? 'not-allowed' : 'grab');
        }
    }

    // if the game is active
    if (!game.inactive) {
        // show the hover effect on the shuffle button
        const xOnShuffle = x > canvas.bankShuffleButton.position.start.x && x < canvas.bankShuffleButton.position.end.x;
        const yOnShuffle = y > canvas.bankShuffleButton.position.start.y && y < canvas.bankShuffleButton.position.end.y;
        if (!dragged && xOnShuffle && yOnShuffle && e.type !== 'touchmove') {
            cursor = 'pointer';
            canvas.bankShuffleButton.hover = true;
        } else {
            canvas.bankShuffleButton.hover = false;
        }
    }
    
    if (dragged) {
        cursor = 'no-drop';

        if (!tile) {
            cursor = (game.inactive ? 'no-drop' : 'grabbing');
        }

        // remove all gaps between letters in bank
        canvas.extraGapBeforeBank = 0;
        for (let i in canvas.bank) {
            canvas.bank[i].extraGapAfter = 0;
        }

        if (boardY > 14) {
            cursor = 'grabbing';

            // expand the space between letters in bank as necessary
            for (let i in canvas.dropZones) {
                // if the user is dragging over this zone
                const xInDropZone = x >= canvas.dropZones[i].start.x && x < canvas.dropZones[i].end.x;
                const yInDropZone = y >= canvas.dropZones[i].start.y && y < canvas.dropZones[i].end.y;
                if (xInDropZone && yInDropZone) {
                    // make the gap bigger
                    if (i == 0) {
                        canvas.extraGapBeforeBank = 1;
                    } else {
                        const current = canvas.bank[canvas.bankOrder[canvas.dropZones[i].orderIndex - 1]]
                        current.gapAnimation = new Animation(100, 0, current.extraGapAfter, 1);
                    }
                }
            }
        }
    }

    // set the css
    document.getElementById('scrabbleCanvas').style.cursor = cursor;
}

function handleDocumentMouseUp(e) {
	// determine whether it is the current user's turn
	const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;
    
    // get the pixel position of the mouse/finger
    let x, y;
    if (e.type === 'touchend') {
        x = e.changedTouches[0].clientX - canvas.c.getBoundingClientRect().left;
        y = e.changedTouches[0].clientY - canvas.c.getBoundingClientRect().top;
    } else {
        x = e.offsetX;
        y = e.offsetY;
    }

    // if the game is active
    if (!game.inactive) {
        // check for the shuffle button
        const xOnShuffle = x > canvas.bankShuffleButton.position.start.x && x < canvas.bankShuffleButton.position.end.x;
        const yOnShuffle = y > canvas.bankShuffleButton.position.start.y && y < canvas.bankShuffleButton.position.end.y;
        if (!dragged && xOnShuffle && yOnShuffle && canvas.bankShuffleButton.clicking) {
            shuffleBank();

            // don't register double click on shuffle button as double click on canvas
            canvas.doubleTap = false;
        }
        canvas.bankShuffleButton.clicking = false;
        if (e.type === 'touchend') canvas.bankShuffleButton.hover = false;
    }

    // cancel if no tile is being dragged
    if (!dragged) {
        return;
    }

    // cancel if a popup is open
    if (visiblePopups.length > 0) {
        return;
    }

    const boardX = Math.floor(x / (squareWidth + squareGap));
    const boardY = Math.floor(y / (squareWidth + squareGap));

    // determine whether the tile has moved since touchdown (or if it has been clicked)
    const stayedStill = dragged?.posHistory?.length === 1;

    const onBoard = (x >= 0 && x <= canvas.c.width) && (y >= 0 && y <= canvas.c.width);
    const onExistingTile = game.board?.[boardY]?.[boardX];

    const outOfTurn = !(!game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id);

    let sendPointsRequest = true;

    // only if the letter was moved to a free space on the board
    if (onBoard && !onExistingTile && !stayedStill && !game.inactive) {
        addLetter(boardX, boardY, dragged.bankIndex); // add the letter to the appropriate spot on the board
    } else { // if the letter was dropped anywhere else or stayed still

        // find out if it was dropped into a drop zone
        for (let i in canvas.dropZones) {

            // if the user dropped into this zone
            const xInZone = (x > canvas.dropZones[i].start.x && x < canvas.dropZones[i].end.x);
            const yInZone = (y > canvas.dropZones[i].start.y && y < canvas.dropZones[i].end.y);
            if (xInZone && yInZone) {

                const from = canvas.bankOrder.indexOf(dragged.bankIndex);
                const to = canvas.dropZones[parseInt(i)].orderIndex;

                // move the letter
                moveBankLetter(from, to);

                // remove any extra gap before or after any letter
                canvas.extraGapBeforeBank = 0;
                for (let j in canvas.bank) {
                    canvas.bank[j].extraGapAfter = 0;
                }
            }
        }

        // if there is already a points preview, show it
        if (canvas.pointsPreview) {
            canvas.pointsPreview.hidden = false;
            sendPointsRequest = false;
        }

        canvas.bank[dragged.bankIndex].hidden = false; // show the letter in the bank
    }

    // show the points preview
    if (sendPointsRequest) checkPoints();
    
    dragged = undefined; // remove the dragged tile
}