var canvas = {};

const BOARD_PIXEL_SCALE = 2;

const BOARD_BACKGROUND_COLOR = "#f2f5ff";
const BOARD_COLOR_KEY = ["#00000009", "#6dd0f7", "#1b4afc", "#faaab5", "#ff2c2b", "#faaab5"];
const BOARD_SQUARE_TYPES = ["outline", "fill", "fill", "fill", "fill", "fill"];
const OUTLINE_THICKNESS = 0.1;
const SQUARE_CONTENTS = ["", "L2", "L3", "W2", "W3", ""];
const SQUARE_NUM = 15;
const SQUARE_GAP = -0.5;
const SQUARE_INSET = 0.15;
const GRADIENT_PADDING = 0.2;
var squareWidth;

function canvasInit() {
	canvas.destruct = false;
	canvas.c = document.getElementById("scrabbleCanvas");
	canvas.ctx = canvas.c.getContext('2d');

	setCanvasSize();

	// set the frame refresh rate
	if (canvas.animationFrame) {window.cancelAnimationFrame(canvas.animationFrame)}
	canvas.animationFrame = window.requestAnimationFrame(updateDisplay);

	// animate the new tiles in
	if (!game.inactive) {
		stopAnimatingMoves();
		animateMoves(getPlayerLastTurn() + 1);
	};
	
	// initialize the shuffle button
	canvas.bankShuffleButton = {
		hover: false,
		clicking: false,
		position: {
			start: {},
			end: {}
		}
	}

	// initialize the bank animations
	canvas.animations = {};

	// remove any points preview
	canvas.pointsPreview = false;

	// remove any extra gap before the bank
	canvas.extraGapBeforeBank = 0;

	// handle window resize
	window.onresize = setCanvasSize;

	canvas.initialized = true;
}

function animateMoves(startingAt = 0) {
	if (canvas.movesAnimating) {
		stopAnimatingMoves();
		return;
	}

	let delay = 0;
	const duration = 750;
	let animations = {};
	for (let i = startingAt; i < game.turn; i++) {
		animations[i] = new Anim(duration, delay);
		delay += duration;
	}

	// figure out what tiles should animate
	for (let y in game.board) {
		for (let x in game.board[y]) {
			if (game.board?.[y]?.[x] && animations[game.board[y][x].turn]) {
				game.board[y][x].animation = animations[game.board[y][x].turn];
			}
		}
	}

	canvas.movesAnimating = setTimeout(stopAnimatingMoves, duration * (game.turn - startingAt));

	setHistoryButtonMode('%auto');
}

function stopAnimatingMoves() {
	if (!canvas.movesAnimating) {
		return;
	}

	clearTimeout(canvas.movesAnimating);
	canvas.movesAnimating = undefined;

	for (let y in game.board) {
		for (let x in game.board[y]) {
			if (game.board?.[y]?.[x]) {
				game.board[y][x].animation = undefined;
			}
		}
	}

	setHistoryButtonMode('%auto');
}

function setCanvasSize() {
	// hide the canvas first (to let the grid adjust properly)
	canvas.c.style.display = "none";

	const canvasWrapper = document.getElementById('canvasWrapper');
	const wrapperWidth = canvasWrapper.getBoundingClientRect().width;
	const wrapperHeight = canvasWrapper.getBoundingClientRect().height;

	// the height of the canvas needs to be a lot less if the bank is empty or if vertical space is limited
	let sizeDifference = 100;
	const isBankEmpty = game.players.find((a)=>a.id == account.id).letterBank.length === 0;
	const vertSpaceLimited = window.innerHeight <= 700;
	if (isBankEmpty) {
		sizeDifference = 40;
	} else if (vertSpaceLimited) {
		sizeDifference = 40;
	}

	canvas.vertSpaceLimited = vertSpaceLimited;

	// calculate which dimension will limit the size
	var limitingDimension = Math.min(wrapperWidth + sizeDifference, wrapperHeight);

	// size the canvas accordingly
	canvas.c.width = (limitingDimension - sizeDifference) * BOARD_PIXEL_SCALE;
	canvas.c.height = limitingDimension * BOARD_PIXEL_SCALE;

	// show the canvas again
	canvas.c.style.display = "";

	// resize the chat box
	chatBoxResize();
}

function clearCanvas() {
	canvas.ctx.clearRect(0, 0, canvas.c.width, canvas.c.height);
}

function drawBoard() {
	// calculate some values
	squareWidth = (canvas.c.width - (SQUARE_GAP * (SQUARE_NUM - 1))) / SQUARE_NUM;
	const fontSize = squareWidth * 0.5;
	const cornerRadius = 5 * (squareWidth * 0.03);
	const roundOuterCorners = window.innerWidth <= 500;

	// draw the background
	canvas.ctx.fillStyle = BOARD_BACKGROUND_COLOR;
	roundRect(canvas.ctx, 0, 0, canvas.c.width, canvas.c.width, roundOuterCorners ? 0 : cornerRadius);

	const boardModifiers = boardInfo.modifiers;

	for (var y = 0; y < SQUARE_NUM; y++) { // for each tile
		for (var x = 0; x < SQUARE_NUM; x++) {
			const squareColor = BOARD_COLOR_KEY[boardModifiers[y][x]];
			const squareType = BOARD_SQUARE_TYPES[boardModifiers[y][x]];
			const squareContents = SQUARE_CONTENTS[boardModifiers[y][x]];
			if (squareColor === "transparent") continue; // skip regular/transparent tiles since they are the same as the background

			canvas.ctx.fillStyle = squareColor;
			let xPos = (x * squareWidth) + (x * SQUARE_GAP) + ((SQUARE_INSET * squareWidth) / 2);
			let yPos = (y * squareWidth) + (y * SQUARE_GAP) + ((SQUARE_INSET * squareWidth) / 2);

			const insetRadius = cornerRadius - ((SQUARE_INSET * squareWidth) / 2);

			// draw the square
			if (squareType === "outline") {
				canvas.ctx.strokeStyle = squareColor;
				const borderThickness = squareWidth * OUTLINE_THICKNESS;
				canvas.ctx.lineWidth = borderThickness;
				const w = squareWidth - (SQUARE_INSET * squareWidth) - borderThickness;
				roundRect(canvas.ctx, xPos + (borderThickness / 2), yPos + (borderThickness / 2), w, w, insetRadius - (borderThickness / 2), false);
			} else {
				const w = squareWidth - (SQUARE_INSET * squareWidth);
				roundRect(canvas.ctx, xPos, yPos, w, w, insetRadius);
			}

			// show the board multiplier strings
			if (squareContents) {
				canvas.ctx.font = fontSize + "px Rubik";
				canvas.ctx.fillStyle = squareType === "outline" ? squareColor : "#f2f5ff";
				canvas.ctx.textAlign = "center";
				canvas.ctx.fillText(SQUARE_CONTENTS[boardModifiers[y][x]], (x * squareWidth) + (x * SQUARE_GAP) + (squareWidth / 2), (y * squareWidth) + (y * SQUARE_GAP) + (squareWidth / 2) + (fontSize / 2.5));
			}
		}
	}
}

function drawLetterBank() {
	// get the bank without any hidden letters
	let bank = [];
	let canvasBankIndex = 0;
	for (var i = 0; i < canvas.bank.length; i++) {
		if (!canvas.bank[i].hidden) {
			bank.push(canvas.bank[i]);
			bank[bank.length - 1].canvasBankIndex = canvasBankIndex;
		}
		canvasBankIndex++;
	}

	// find where the board ends and the bank starts
	const canvasWidth = canvas.c.width;
	const startY = canvasWidth;
	let remainingSpace = canvas.c.height - startY;

	// draw title and shuffle button if space allows
	let titleSize = -15 * BOARD_PIXEL_SCALE; // this accounts for padding when the title isn't there
	if (!canvas.vertSpaceLimited || canvas.bank.length === 0) {
		const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
		titleSize = (canvas.bank.length > 0 ? 25 : 15) * BOARD_PIXEL_SCALE;
		canvas.ctx.font = titleSize + "px Rubik";
		canvas.ctx.fillStyle = textColor;
		canvas.ctx.textAlign = "center";
		canvas.ctx.fillText((canvas.bank.length > 0 ? "Letter Bank" : "Your letter bank is empty."), canvasWidth / 2, startY + titleSize + (10 * BOARD_PIXEL_SCALE));

		// if the game is active
		if (!game.inactive) {
			// draw the letter bag count
			const lbcSize = titleSize * (2 / 3);
			const lbcY = startY + lbcSize + 3;

			canvas.ctx.font = lbcSize + "px Rubik";
			const numberWidth = canvas.ctx.measureText(game.lettersLeft).width;

			canvas.ctx.font = lbcSize + "px scrabble";
			const iconWidth = canvas.ctx.measureText("\ue900").width;

			const totalWidth = numberWidth + (5 * BOARD_PIXEL_SCALE) + iconWidth;
			
			const lbcX = (canvasWidth / 2) - (90 * BOARD_PIXEL_SCALE) + (lbcSize / 2);
			const iconStartX = lbcX - totalWidth;
			const numberStartX = lbcX - numberWidth;

			canvas.ctx.font = lbcSize + "px scrabble";
			canvas.ctx.fillStyle = textColor;
			canvas.ctx.textAlign = "left";
			canvas.ctx.textBaseline = "top";

			canvas.ctx.fillText("\ue900", iconStartX, lbcY);

			canvas.ctx.font = lbcSize + "px Rubik";
			canvas.ctx.fillText(game.lettersLeft, numberStartX, lbcY);



			// draw the bank shuffle button
			const shuffleButtonX = (canvasWidth / 2) + (90 * BOARD_PIXEL_SCALE);
			const shuffleButtonY = startY + titleSize + (14 * BOARD_PIXEL_SCALE);

			// draw background if hovering/clicking and cooldown is not active
			if (!canvas.bankShuffleButton.cooldown && canvas.bankShuffleButton.clicking) {
				canvas.ctx.fillStyle = "#0000004C";
			} else if (canvas.bankShuffleButton.hover) {
				canvas.ctx.fillStyle = "#00000033";
			} else if (canvas.bankShuffleButton.hoverFade) {
				const opa = canvas.bankShuffleButton.hoverFade.getFrame();
				canvas.ctx.fillStyle = lerpColor("#00000000", "#00000033", opa);
			} else {
				canvas.ctx.fillStyle = "#00000000";
			}
			canvas.ctx.beginPath();
			canvas.ctx.arc(shuffleButtonX, shuffleButtonY - (titleSize / 2), (titleSize / 2) + (5 * BOARD_PIXEL_SCALE), 0, 2 * Math.PI, false);
			canvas.ctx.fill();
			
			// draw the icon
			canvas.ctx.font = titleSize + "px Material Symbols Rounded";
			canvas.ctx.fillStyle = textColor;
			canvas.ctx.textAlign = "center";
			canvas.ctx.textBaseline = "alphabetic";

			canvas.ctx.fillText("shuffle", shuffleButtonX, shuffleButtonY);
			
			// store the coordinates so we know when we click on it
			canvas.bankShuffleButton.position = {
				start: {
					x: shuffleButtonX - (titleSize / 2) - (5 * BOARD_PIXEL_SCALE),
					y: shuffleButtonY - titleSize - (5 * BOARD_PIXEL_SCALE)
				},
				end: {
					x: shuffleButtonX + (titleSize / 2) + (5 * BOARD_PIXEL_SCALE),
					y: shuffleButtonY + 5
				}
			}

			// determine if any letter will be highlighted
			let anyHighlighed = false;
			for (let i = 0; i < canvas.bank.length; i++) {
				if (canvas.bank[i]?.highlight) {
					anyHighlighed = true;
					break;
				}
			}

			// draw the new letters key if needed
			if (anyHighlighed) {
				canvas.ctx.save();

				const y = shuffleButtonY - (titleSize / 2);
				const circleX = canvas.bankShuffleButton.position.end.x + (15 * BOARD_PIXEL_SCALE);
				const textX = circleX + (10 * BOARD_PIXEL_SCALE);

				// draw the yellow circle
				canvas.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-highlight');
				canvas.ctx.beginPath();
				canvas.ctx.arc(circleX, y, (5 * BOARD_PIXEL_SCALE), 0, Math.PI * 2);
				canvas.ctx.fill();
				
				// draw the text
				canvas.ctx.fillStyle = textColor;
				canvas.ctx.font = lbcSize + "px Rubik";
				canvas.ctx.textAlign = "left";
				canvas.ctx.textBaseline = "middle";
				canvas.ctx.fillText("New", textX, y);

				canvas.ctx.restore();
			}
		}
	}

	// STOP here if the bank is empty
	if (canvas.bank.length === 0) return;

	remainingSpace -= titleSize + (20 * BOARD_PIXEL_SCALE);

	// define some constants
	const numTiles = bank.length;

	const minTileGap = (5 * BOARD_PIXEL_SCALE);
	const extraTileGap = (50 * BOARD_PIXEL_SCALE);

	if (!canvas.dropZones) canvas.dropZones = [];

	// determine the per-zone expansion amts and total gap space
	let totalGapSpace = bank.length * minTileGap;
	const expansionAmts = [];
	for (let i = 0; i < canvas.dropZones.length && i <= bank.length; i++) {
		const zoneExp = canvas.dropZones[i].expansion;
		const expansionAmt = typeof zoneExp === "boolean" ? (zoneExp ? 1 : 0) : zoneExp?.getFrame() || 0;

		expansionAmts.push(expansionAmt);
		totalGapSpace += expansionAmt * extraTileGap;
	}

	const tileWidth = Math.min(remainingSpace - (5 * BOARD_PIXEL_SCALE), ((canvasWidth - totalGapSpace) / numTiles), (55 * BOARD_PIXEL_SCALE));
	const totalBankWidth = (tileWidth * numTiles) + totalGapSpace;
	const startX = (canvasWidth - totalBankWidth) / 2;

	canvas.bankTileWidth = tileWidth;

	const textSize = tileWidth - (5 * BOARD_PIXEL_SCALE);
	const smallTextSize = textSize / 3;

	let currentTotalGapSpace = (expansionAmts[0] || 0) * extraTileGap;

	// draw each letter
	let firstLetter, drawnLetters = 0;
	for (let i = 0; i < canvas.bankOrder.length; i++) {
		const canvasLetter = canvas.bank[canvas.bankOrder[i]];

		// don't display the letter if it is hidden
		if (canvasLetter?.hidden) continue;

		if (!firstLetter) firstLetter = canvasLetter;

		// calculate where to start
		let x = startX + (tileWidth * drawnLetters) + currentTotalGapSpace;
		let y = startY + titleSize + (20 * BOARD_PIXEL_SCALE);

		// bank shuffle animation
		if (canvas.animations?.bankShuffle) {
			let animationRandMultiplier;
			if (!canvasLetter.animationRandMultiplier) {
				canvasLetter.animationRandMultiplier = Math.random();
			}
			animationRandMultiplier = canvasLetter.animationRandMultiplier;

			const frame = canvas.animations.bankShuffle.getFrame();
			const frameMultiplier = Math.abs(frame - 0.5) * 2;
			x = ((x - (canvasWidth / 2)) * frameMultiplier) + (canvasWidth / 2);
			y += Math.sin( (frameMultiplier - 1) * Math.PI * 0.5 )
			     * 50 * animationRandMultiplier * ((i % 2) - 0.5);
		}
		
		// store the position of the tile
		canvasLetter.position.x = x;
		canvasLetter.position.y = y;

		// calculate the position of the letter and points on the tile
		const textX = x + (tileWidth / 2);
		const textY = y + (tileWidth / 2) + (textSize / 3);

		const pointsX = x + (tileWidth * 0.9);
		const pointsY = y + (tileWidth * 0.9);

		// calculate the amount of gap space after this tile
		const gapSpaceAfter = minTileGap + ((expansionAmts[drawnLetters + 1] || 0) * extraTileGap);

		// after calculating, increase the current gap space
		currentTotalGapSpace += gapSpaceAfter;

		// draw outline if highlighted
		if (canvasLetter.highlight) {
			canvas.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-highlight');
			roundRect(canvas.ctx, x - (3 * BOARD_PIXEL_SCALE), y - (3 * BOARD_PIXEL_SCALE), tileWidth + (6 * BOARD_PIXEL_SCALE), tileWidth + (6 * BOARD_PIXEL_SCALE), (8 * BOARD_PIXEL_SCALE));
		}

		// draw tile
		canvas.ctx.fillStyle = "#a47449"; // tile brown
		roundRect(canvas.ctx, x, y, tileWidth, tileWidth, 5 * BOARD_PIXEL_SCALE);

		// if not blank
		if (canvasLetter.letter) {
			// draw letter
			canvas.ctx.fillStyle = "#f2f5ff" // tile text color
			canvas.ctx.font = textSize + "px Eurostile";
			canvas.ctx.textAlign = "center";
			const letter = langInfo[game.lang].letterReplacements[canvasLetter.letter] || canvasLetter.letter;
			canvas.ctx.fillText(letter, textX, textY);

			// draw points
			let points = langInfo[game.lang].letterScores[canvasLetter.letter.toUpperCase()];

			canvas.ctx.font = smallTextSize + "px Eurostile";
			canvas.ctx.textAlign = "right";
			canvas.ctx.fillText(points, pointsX, pointsY);
		}

		drawnLetters++;

		// calculate and store drop zone size and position
		const dropZoneStart = {
			x: canvasLetter.position.x + (canvas.bankTileWidth / 2),
			y: canvasLetter.position.y - (canvas.bankTileWidth / 5)
		};
		const dropZoneEnd = {
			x: canvasLetter.position.x + (canvas.bankTileWidth * 1.5) + gapSpaceAfter,
			y: canvasLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
		}
		
		const dropZone = canvas.dropZones[drawnLetters];
		if (!dropZone) {
			canvas.dropZones[drawnLetters] = { start: dropZoneStart, end: dropZoneEnd, orderIndex: i + 1 };
		} else {
			dropZone.start = dropZoneStart;
			dropZone.end = dropZoneEnd;
			dropZone.orderIndex = i + 1;
		}
	}

	// store the first drop zone if we have at least one letter
	if (firstLetter) {
		const dropZoneStart = {
			x: firstLetter.position.x - (minTileGap + ((expansionAmts[0] || 0) * extraTileGap)) - (canvas.bankTileWidth / 2),
			y: firstLetter.position.y - (canvas.bankTileWidth / 5)
		};
		const dropZoneEnd = {
			x: firstLetter.position.x + (canvas.bankTileWidth / 2),
			y: firstLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
		};
		const orderIndex = canvas.bankOrder.indexOf(firstLetter.bankIndex);

		const firstDropZone = canvas.dropZones[0];
		if (!firstDropZone) {
			canvas.dropZones[0] = { start: dropZoneStart, end: dropZoneEnd, orderIndex: orderIndex };
		} else {
			firstDropZone.start = dropZoneStart;
			firstDropZone.end = dropZoneEnd;
			firstDropZone.orderIndex = orderIndex;
		}
	}

	// remove extra drop zones
	canvas.dropZones.splice(drawnLetters + 1);

	/* // draw drop zones for testing
	for (let i in canvas.dropZones) {
		const x = canvas.dropZones[i].start.x;
		const y = canvas.dropZones[i].start.y;
		const width = canvas.dropZones[i].end.x - x;
		const height = canvas.dropZones[i].end.y - y;

		canvas.ctx.fillStyle = "#0000FF66";
		canvas.ctx.fillRect(x, y, width, height);

		canvas.ctx.strokeStyle = "#0000FF99";
		canvas.ctx.lineWidth = 1;
		canvas.ctx.strokeRect(x, y, width, height);
	} */
}

function updateTile(tile) {
	// figure out animiation stuff
	var tileSize = (tile.size === undefined ? 1 : tile.size);

	// don't even bother drawing tile if size is 0
	if (tileSize === 0) return;

	var borderRadius = 5 * (squareWidth * 0.03) * tileSize;

	var tileWidth = squareWidth * tileSize;
	var fontSize = tileWidth * 0.83;

	// get the exact pixel positions
	let pixelX, pixelY;

	// get the exact x pixel position
	if (typeof tile.pixelX === "number") {
		// if the tile is being manually positioned (it is probably being dragged)
		let xOffset = -squareWidth / 2;
		if (typeof tile.mouseOffset?.x === "number") xOffset = tile.mouseOffset.x;

		pixelX = tile.pixelX + xOffset;
	} else {
		// if the tile is positioned on the grid
		const squarePos = (tile.x * squareWidth) + (tile.x * SQUARE_GAP);
		const shrunkenTileOffset = (squareWidth - tileWidth) / 2;

		pixelX = squarePos + shrunkenTileOffset;
	}

	// get the exact y pixel position
	if (typeof tile.pixelY === "number") {
		// if the tile is being manually positioned (it is probably being dragged)
		let yOffset = -squareWidth / 2;
		if (typeof tile.mouseOffset?.y === "number") yOffset = tile.mouseOffset.y;

		pixelY = tile.pixelY + yOffset;
	} else {
		// if the tile is positioned on the grid
		const squarePos = (tile.y * squareWidth) + (tile.y * SQUARE_GAP);
		const shrunkenTileOffset = (squareWidth - tileWidth) / 2;

		pixelY = squarePos + shrunkenTileOffset;
	}

	// account for snapFrom animation
	const t = tile.snapFrom?.anim.getFrame();
	if (tile.snapFrom) {
		pixelX = lerp(tile.snapFrom.x, pixelX, t);
		pixelY = lerp(tile.snapFrom.y, pixelY, t);
	}

	// draw the tile
	const darkenTile = canvas.darkenTiles?.find(a => a.x == tile.x && a.y == tile.y);
	const darkenAmt = darkenTile ? (darkenTile.fade ? darkenTile.fade.getFrame() : 1) : 0;
	const snapFromAmt = tile.snapFrom ? tile.snapFrom.anim.getFrame() : 1;
	canvas.ctx.fillStyle = lerpColor("#a47449", "#7d5837", snapFromAmt * darkenAmt) + (tile.locked ? "" : "cc"); // tile brown


	const radii = { tl: borderRadius, tr: borderRadius, bl: borderRadius, br: borderRadius };
	if (typeof tile.x === "number" && typeof tile.y === "number") { // if it has an actual spot on the board (not being dragged)
		const upTile = game.board[tile.y - 1]?.[tile.x];
		if (upTile) {
			const m = upTile.snapFrom ? 1-upTile.snapFrom.anim.getFrame() : 1-snapFromAmt;
			radii.tl *= m;
			radii.tr *= m;
		}
		const downTile = game.board[tile.y + 1]?.[tile.x];
		if (downTile) {
			const m = downTile.snapFrom ? 1-downTile.snapFrom.anim.getFrame() : 1-snapFromAmt;
			radii.bl *= m;
			radii.br *= m;
		}
		const leftTile = game.board[tile.y][tile.x - 1];
		if (leftTile) {
			const m = leftTile.snapFrom ? 1-leftTile.snapFrom.anim.getFrame() : 1-snapFromAmt;
			radii.tl *= m;
			radii.bl *= m;
		}
		const rightTile = game.board[tile.y][tile.x + 1];
		if (rightTile) {
			const m = rightTile.snapFrom ? 1-rightTile.snapFrom.anim.getFrame() : 1-snapFromAmt;
			radii.tr *= m;
			radii.br *= m;
		}
	}
	roundRect(canvas.ctx, pixelX, pixelY, tileWidth, tileWidth, radii);

	// draw the letter on the tile
	if (tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff66"; // tile text color but transparent
	} else {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
	}
	canvas.ctx.font = fontSize + "px Eurostile";
	canvas.ctx.textAlign = "center";
	canvas.ctx.textBaseline = "middle";
	const letter = tile.letter ? (langInfo[game.lang].letterReplacements[tile.letter] || tile.letter) : "";
	canvas.ctx.fillText(letter, pixelX + (tileWidth / 2), pixelY + (tileWidth / 2));
	canvas.ctx.textBaseline = "alphabetic";

	// draw the points on the tile if size allows
	if (squareWidth >= 35 && !tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
		canvas.ctx.font = (fontSize / 3) + "px Eurostile";
		canvas.ctx.textAlign = "right";
		canvas.ctx.fillText(langInfo[game.lang].letterScores[tile.letter], (pixelX + (tileWidth * 0.9)), (pixelY + (tileWidth * 0.9)));
	}
}

function drawRegions(regions) {
	// a region might look something like this:
	/*
		{
			"start": [0, 1], **
			"end": [2, 3], **
			"points": 4,
			"color": "#56789A",
			"textColor": "#BCDEF0",
			"opacity": Anim {...},
			"opacity": 0.1,
			"pulse": Anim {...},
			"removeCondition": () => a > b,
			"grow": Anim {...}
		}

		** = Required
	*/

	// draw each region
	for (let i = 0; i < regions.length; i++) {
		if (regions[i].hidden) continue;

		const growFrame = regions[i].grow ? regions[i].grow.getFrame() : 1;

		// calculate the positions
		let x1 = regions[i].start[0] * (squareWidth + SQUARE_GAP);
		let y1 = regions[i].start[1] * (squareWidth + SQUARE_GAP);
		let x2 = (regions[i].end[0] * (squareWidth + SQUARE_GAP)) + squareWidth;
		let y2 = (regions[i].end[1] * (squareWidth + SQUARE_GAP)) + squareWidth;

		// determine whether it is the current user's turn
		const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

		// set up the style
		let rawColor = regions[i].color || getComputedStyle(document.documentElement).getPropertyValue(userTurn ? '--highlight' : '--semi-highlight');

		let opacity;
		if (typeof regions[i].opacity !== 'number' && !regions[i].opacity) {
			opacity = false;
		} else if (typeof regions[i].opacity === 'object') {
			opacity = regions[i].opacity.getFrame();
		} else {
			opacity = regions[i].opacity;
		}
		
		if (regions[i].removeCondition && regions[i].removeCondition()) {
			// remove the region if the remove condition is met
			regions.splice(i, 1);
			i--;
			continue;
		}

		const [r, g, b] = getRGBA(rawColor);
		const calculatedColor = opacity ? "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")" : rawColor;

		if (regions[i].pulse) {
			const ogXDiff = x2 - x1;
			const ogYDiff = y2 - y1;
			const gradStart = [x1 - ogXDiff, y1 - ogYDiff];
			const gradEnd = [x2 + ogXDiff, y2 + ogYDiff];

			const gradient = canvas.ctx.createLinearGradient(gradStart[0], gradStart[1], gradEnd[0], gradEnd[1]);

			const frame = regions[i].pulse.getFrame();

			const gradFrame0 = (frame) / 3;
			const middleLower0 = gradFrame0 - (GRADIENT_PADDING / 6);
			const middleUpper0 = gradFrame0 + (GRADIENT_PADDING / 6);
			const lower0 = gradFrame0 - (GRADIENT_PADDING / 3);
			const upper0 = gradFrame0 + (GRADIENT_PADDING / 3);
			const gradFrame1 = (frame + 1) / 3;
			const middleLower1 = gradFrame1 - (GRADIENT_PADDING / 6);
			const middleUpper1 = gradFrame1 + (GRADIENT_PADDING / 6);
			const lower1 = gradFrame1 - (GRADIENT_PADDING / 3);
			const upper1 = gradFrame1 + (GRADIENT_PADDING / 3);
			const gradFrame2 = (frame + 2) / 3;
			const middleLower2 = gradFrame2 - (GRADIENT_PADDING / 6);
			const middleUpper2 = gradFrame2 + (GRADIENT_PADDING / 6);
			const lower2 = gradFrame2 - (GRADIENT_PADDING / 3);
			const upper2 = gradFrame2 + (GRADIENT_PADDING / 3);

			gradient.addColorStop(0, "transparent");

			if (lower0 > 0) gradient.addColorStop(lower0, "transparent");
			if (middleLower0 > 0) gradient.addColorStop(middleLower0, calculatedColor);
			gradient.addColorStop(middleUpper0, calculatedColor);
			gradient.addColorStop(upper0, "transparent");

			gradient.addColorStop(lower1, "transparent");
			gradient.addColorStop(middleLower1, calculatedColor);
			gradient.addColorStop(middleUpper1, calculatedColor);
			gradient.addColorStop(upper1, "transparent");

			gradient.addColorStop(lower2, "transparent");
			gradient.addColorStop(middleLower2, calculatedColor);
			if (middleUpper2 < 1) gradient.addColorStop(middleUpper2, calculatedColor);
			if (upper2 < 1) gradient.addColorStop(upper2, "transparent");

			gradient.addColorStop(1, "transparent");

			canvas.ctx.strokeStyle = gradient;
		} else {
			canvas.ctx.strokeStyle = calculatedColor;
		}
		
		canvas.ctx.fillStyle = calculatedColor;
		canvas.ctx.lineWidth = ((squareWidth * 0.1) + 1) * growFrame;

		const fontSize = 16 * BOARD_PIXEL_SCALE * growFrame;
		canvas.ctx.font = fontSize + "px Rubik";

		// draw the rectangle
		// corner positions are calculated above

		// calculate position for the bubble
		let circX = x2;
		let circY = y1;
		
		const onTopEdge = regions[i].start[1] === 0;
		const onRightEdge = regions[i].end[0] === 14;

		const width = x2 - x1;
		const height = y2 - y1;

		const cornerRadius = 5 * (squareWidth * 0.03);

		if (growFrame > 0) roundRect(canvas.ctx, x1, y1, width, height, cornerRadius, false);

		const radius = (15 * BOARD_PIXEL_SCALE);

		// move the bubble over if it is on an edge
		if (onRightEdge) {
			circX -= (radius - 1);
		}
		if (onTopEdge) {
			circY += (radius - 1);
		}

		if (regions[i].points) {
			// draw the bubble
			canvas.ctx.beginPath();
			canvas.ctx.arc(circX, circY, radius * growFrame, 0, 2*Math.PI);
			canvas.ctx.fill();

			// draw the number on the bubble
			canvas.ctx.fillStyle = regions[i].textColor || getComputedStyle(document.documentElement).getPropertyValue(userTurn ? '--highlight-text' : '--semi-highlight-text');
			canvas.ctx.textAlign = "center";
			canvas.ctx.fillText(regions[i].points.toString(), circX, circY + (fontSize / 3));
			canvas.ctx.textAlign = "";
		}
	}
}

function tempHighlight(
	region,
	color = getComputedStyle(document.documentElement).getPropertyValue('--text-highlight'),
	duration = 1000,
	delay = 2000
) {
	region.color = color;
	region.textColor = autoContrast(color) ? "#000000" : "#FFFFFF";
	region.opacity = new Anim(duration, delay, 1, 0);
	region.removeCondition = () => region.opacity.isComplete();

	addRegion(region);
}

function addRegion(region) {
	if (!canvas.regions) canvas.regions = [];
	canvas.regions.push(region);
}

// draw loop
// this function is run to draw each frame
function updateDisplay() {
	clearCanvas();
	
	// destruct if necessary
	if (canvas.destruct) {
		canvas = {};
		return;
	}

	// draw the background for the board
	drawBoard();
	
	// draw the title, shuffle button, and letter bank
	drawLetterBank();

	// draw each tile on the board
	for (var y in game.board) {
		for (var x in game.board[y]) {
			if (game.board?.[y]?.[x]) {
				// set the size based on the animation (if it has one)
				let size = 1;
				if (game.board[y][x].animation) {
					size = game.board[y][x].animation.getFrame();
				}
				game.board[y][x].size = size;

				// update the tile
				updateTile(game.board[y][x]);
			}
		}
	}
	if (canvas.pointsPreview) {
		drawRegions([ canvas.pointsPreview ]);
	}
	if (canvas.regions) {
		drawRegions(canvas.regions);
	}
	if (dragged) {
		updateTile(dragged);
	}

	// request the next animation frame
	canvas.animationFrame = window.requestAnimationFrame(updateDisplay);
}

// from https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
// draws a rounded rectangle
function roundRect(ctx, x, y, width, height, radius, fill = true) {
	if (typeof radius === 'undefined') {
		radius = Math.min(5, Math.min(width, height) / 2);
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
}