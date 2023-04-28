var canvas = {};

const boardColorKey = ["#f2f5ff", "#6dd0f7", "#1b4afc", "#faaab5", "#ff2c2b", "#faaab5"];
const boardMultiplierStrings = ["", "L2", "L3", "W2", "W3", ""];
const squareNum = 15;
const squareGap = 1;
var squareWidth;

function canvasInit() {
	canvas.c = document.getElementById("scrabbleCanvas");

	setCanvasSize();

	canvas.ctx = canvas.c.getContext('2d');

	// set the frame refresh rate
	if (canvas.animationFrame) {window.cancelAnimationFrame(canvas.animationFrame)}
	canvas.animationFrame = window.requestAnimationFrame(updateDisplay);

	// get the player's last turn
	let playerLastTurn = getPlayerLastTurn();

	let highlightTurns = range(playerLastTurn + 1, game.turn);

	let delay = 0;
	const duration = 750;
	let animations = {};
	for (let i in highlightTurns) {
		animations[highlightTurns[i]] = new Animation(duration, delay);
		delay += duration;
	}

	// figure out what tiles should animate
	for (let y in game.board) {
		for (let x in game.board) {
			if (game.board?.[y]?.[x] && animations[game.board[y][x].turn]) {
				game.board[y][x].animation = animations[game.board[y][x].turn];
			}
		}
	}

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
}

function setCanvasSize() {
	const canvasWrapper = $('#canvasWrapper');

	// the height of the canvas needs to be a lot less if the bank is empty
	const isBankEmpty = game.players.find((a)=>a.id == account.id).letterBank.length === 0;
	const sizeDifference = (isBankEmpty ? 40 : 100);

	// hide the canvas first (to let the grid adjust properly)
	canvas.c.style.display = "none";
	
	// get the dimensions that we have to work with
	const canvasWrapperWidth = canvasWrapper.width();
	const canvasWrapperHeight = canvasWrapper.height();

	// calculate which dimension will limit the size
	var limitingDimension = Math.min(canvasWrapperWidth + sizeDifference, canvasWrapperHeight);

	// size the canvas accordingly
	canvas.c.width = limitingDimension - sizeDifference;
	canvas.c.height = limitingDimension;

	// show the canvas again
	canvas.c.style.display = "";
}

function clearCanvas() {
	canvas.ctx.clearRect(0, 0, canvas.c.width, canvas.c.height);
}

function drawBoard() {
	// get some sizes
	squareWidth = (canvas.c.width - (squareGap * (squareNum - 1))) / squareNum;
	let fontSize = squareWidth * 0.5;
	for (var y = 0; y < squareNum; y++) { // for each tile
		for (var x = 0; x < squareNum; x++) {
			canvas.ctx.fillStyle = boardColorKey[boardModifiers[y][x]];
			let xPos = (x * squareWidth) + (x * squareGap);
			let yPos = (y * squareWidth) + (y * squareGap);

			// round the corners of the board
			let radii = {
				tl: (y === 0 && x === 0 ? 10 : 0),
				tr: (y === 0 && x === 14 ? 10 : 0),
				bl: (y === 14 && x === 0 ? 10 : 0),
				br: (y === 14 && x === 14 ? 10 : 0)
			}

			// draw the square
			roundRect(canvas.ctx, xPos, yPos, squareWidth, squareWidth, radii);
			//squareWidth >= 35 &&
			// if size permits, show the board multiplier strings
			if ( boardMultiplierStrings[boardModifiers[y][x]]) {
				canvas.ctx.font = fontSize + "px Rubik";
				canvas.ctx.fillStyle = "#f2f5ff";
				canvas.ctx.textAlign = "center";
				canvas.ctx.fillText(boardMultiplierStrings[boardModifiers[y][x]], (x * squareWidth) + (x * squareGap) + (squareWidth / 2), (y * squareWidth) + (y * squareGap) + (squareWidth / 2) + (fontSize / 2.5));
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

	// draw title ("Letter Bank")
	const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
	const titleSize = (canvas.bank.length > 0 ? 25 : 15);
	canvas.ctx.font = titleSize + "px Rubik";
	canvas.ctx.fillStyle = textColor;
	canvas.ctx.textAlign = "center";
	canvas.ctx.fillText((canvas.bank.length > 0 ? "Letter Bank" : "Your letter bank is empty."), canvasWidth / 2, startY + titleSize + 10);

	// STOP here if the bank is empty
	if (canvas.bank.length === 0) return;

	// if the game is active
	if (!game.inactive) {
		// draw the bank shuffle button
		const shuffleButtonX = (canvasWidth / 2) + 90;
		const shuffleButtonY = startY + titleSize + 14;

		// draw background if hovering/clicking and cooldown is not active
		if (!canvas.bankShuffleButton.cooldown && (canvas.bankShuffleButton.hover || canvas.bankShuffleButton.clicking)) {
			canvas.ctx.fillStyle = (canvas.bankShuffleButton.clicking ? "#0000004C" : "#00000033");
			canvas.ctx.beginPath();
			canvas.ctx.arc(shuffleButtonX, shuffleButtonY - (titleSize / 2), (titleSize / 2) + 5, 0, 2 * Math.PI, false);
			canvas.ctx.fill();
		}
		
		// draw the icon
		canvas.ctx.font = titleSize + "px Material Symbols Rounded";
		canvas.ctx.fillStyle = (canvas.bankShuffleButton.cooldown ? textColor + "80" : textColor);
		canvas.ctx.textAlign = "center";

		canvas.ctx.fillText("shuffle", shuffleButtonX, shuffleButtonY);
		
		// store the coordinates so we know when we click on it
		canvas.bankShuffleButton.position = {
			start: {
				x: shuffleButtonX - (titleSize / 2) - 5,
				y: shuffleButtonY - titleSize - 5
			},
			end: {
				x: shuffleButtonX + (titleSize / 2) + 5,
				y: shuffleButtonY + 5
			}
		}
	}

	remainingSpace -= titleSize + 20;

	// define some constants
	const numTiles = bank.length;

	const minTileGap = 5;
	const extraTileGap = 50;

	// check and update gap animations
	if (canvas.gapBeforeBankAnimation) {
		canvas.extraGapBeforeBank = canvas.gapBeforeBankAnimation.getFrame();
		if (canvas.gapBeforeBankAnimation.isComplete()) {
			canvas.gapBeforeBankAnimation = undefined;
		}
	}
	for (let i in bank) {
		let current = bank[i];
		if (!current.hidden) {
			if (current.gapAnimation) {
				current.extraGapAfter = current.gapAnimation.getFrame();
				if (current.gapAnimation.isComplete()) {
					current.gapAnimation = undefined;
				}
			}
		}
	}

	// determine the total amount of gap space we will use
	let totalGapSpace = 0;
	for (let i in bank) {
		totalGapSpace += (minTileGap + (bank[i].extraGapAfter * extraTileGap));
	}
	if (canvas.extraGapBeforeBank) {
		totalGapSpace -= extraTileGap * canvas.extraGapBeforeBank;
		// we are subtracting here because we will add this value to the x position to get the x position of the first tile
		// it doesn't make sense but it works
	}

	const tileWidth = Math.min(remainingSpace - 10, ((canvasWidth - totalGapSpace) / numTiles), 55);
	const totalBankWidth = (tileWidth * numTiles) + totalGapSpace;
	const startX = (canvasWidth - totalBankWidth) / 2;

	canvas.bankTileWidth = tileWidth;

	const textSize = tileWidth - 5;
	const smallTextSize = textSize / 3;

	let currentGapSpace = 0;

	// find the first visible letter
	let firstLetter;
	for (let i in canvas.bankOrder) {
		if (!canvas.bank[canvas.bankOrder[i]].hidden) {
			firstLetter = canvas.bank[canvas.bankOrder[i]];
			break;
		}
	}

	if (firstLetter) {
		// initialize the first drop zone
		canvas.dropZones = [{
			start: {
				x: firstLetter.position.x - (minTileGap + (canvas.extraGapBeforeBank * extraTileGap)) - (canvas.bankTileWidth / 2),
				y: firstLetter.position.y - (canvas.bankTileWidth / 5)
			},
			end: {
				x: firstLetter.position.x + (canvas.bankTileWidth / 2),
				y: firstLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
			},
			orderIndex: canvas.bankOrder.indexOf(firstLetter.bankIndex)
		}];
	} else {
		canvas.dropZones = []; // initialize no drop zones because there are no visible letters in the bank
	}

	// draw each letter
	let drawnLetters = 0;
	for (let i in canvas.bankOrder) {
		const canvasLetter = canvas.bank[canvas.bankOrder[i]];

		// don't display the letter if it is hidden
		if (canvasLetter?.hidden) {
			continue;
		}

		// calculate where to start
		let x = startX + (tileWidth * drawnLetters) + currentGapSpace;
		let y = startY + titleSize + 20;
		if (canvas?.animations?.bankShuffle) {
			let animationRandMultiplier;
			if (!canvasLetter.animationRandMultiplier) {
				canvasLetter.animationRandMultiplier = Math.random();
			}
			animationRandMultiplier = canvasLetter.animationRandMultiplier;

			const frame = canvas.animations.bankShuffle.getFrame();
			const frameMultiplier = Math.abs(frame - 0.5) * 2;
			x = ((x - (canvasWidth / 2)) * frameMultiplier) + (canvasWidth / 2);
			y += Math.sin(
				(frameMultiplier - 1)
				* Math.PI
				* 0.5
			)
			* 50
			* animationRandMultiplier
			* ((i % 2) - 0.5);
		}
		
		// store the position of the tile for later use
		canvasLetter.position.x = x;
		canvasLetter.position.y = y;

		// calculate the position of the letter and points on the tile
		const textX = x + (tileWidth / 2);
		const textY = y + (tileWidth / 2) + (textSize / 3);

		const pointsX = x + (tileWidth * 0.9);
		const pointsY = y + (tileWidth * 0.9);

		// after calculating, increase the current gap space
		currentGapSpace += (minTileGap + (canvasLetter.extraGapAfter * extraTileGap));

		// draw tile
		canvas.ctx.fillStyle = "#a47449"; // tile brown
		roundRect(canvas.ctx, x, y, tileWidth, tileWidth);

		// if not blank
		if (canvasLetter.letter) {
			// draw letter
			canvas.ctx.fillStyle = "#f2f5ff" // tile text color
			canvas.ctx.font = textSize + "px Eurostile";
			canvas.ctx.textAlign = "center";
			canvas.ctx.fillText(canvasLetter.letter, textX, textY);

			// draw points
			let points = letterScores[canvasLetter.letter.toUpperCase()];

			canvas.ctx.font = smallTextSize + "px Eurostile";
			canvas.ctx.textAlign = "right";
			canvas.ctx.fillText(points, pointsX, pointsY);
		}

		// calculate drop zones for the letter bank
		let newZone = {
			start: {
				x: canvasLetter.position.x + (canvas.bankTileWidth / 2),
				y: canvasLetter.position.y - (canvas.bankTileWidth / 5)
			},
			end: {
				x: canvasLetter.position.x + (canvas.bankTileWidth * 1.5) + (minTileGap + (canvasLetter.extraGapAfter * extraTileGap)),
				y: canvasLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
			},
			orderIndex: parseInt(i) + 1
		};
		canvas.dropZones.push(newZone);

		drawnLetters++;
	}

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

	var pixelX = (tile.pixelX + (tile.mouseOffset?.x || -(squareWidth / 2)) || (tile.x * squareWidth) + (tile.x * squareGap)) + ((squareWidth - tileWidth) / 2);
	var pixelY = (tile.pixelY + (tile.mouseOffset?.y || -(squareWidth / 2)) || (tile.y * squareWidth) + (tile.y * squareGap)) + ((squareWidth - tileWidth) / 2);

	// draw the tile
	canvas.ctx.fillStyle = (tile.locked ? "#a47449" : "#a47449cc"); // tile brown
	roundRect(canvas.ctx, pixelX, pixelY, tileWidth, tileWidth, borderRadius);

	// draw the letter on the tile
	if (tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff66"; // tile text color but transparent
	} else {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
	}
	canvas.ctx.font = fontSize + "px Eurostile";
	canvas.ctx.textAlign = "center";
	canvas.ctx.textBaseline = "middle";
	canvas.ctx.fillText(tile.letter || "", pixelX + (tileWidth / 2), pixelY + (tileWidth / 2));
	canvas.ctx.textBaseline = "alphabetic";

	// draw the points on the tile if size allows
	if (squareWidth >= 35 && !tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
		canvas.ctx.font = (fontSize / 3) + "px Eurostile";
		canvas.ctx.textAlign = "right";
		canvas.ctx.fillText(letterScores[tile.letter], (pixelX + (tileWidth * 0.9)), (pixelY + (tileWidth * 0.9)));
	}
}

function drawRegions(regions) {
	// draw each region
	for (let i = 0; i < regions.length; i++) {

		// determine whether it is the current user's turn
		const userTurn = !game.inactive && game.players[parseInt(game.turn) % game.players.length].id == account.id;

		// set up the style
		canvas.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(userTurn ? '--highlight' : '--semi-highlight');
		canvas.ctx.fillStyle = canvas.ctx.strokeStyle;
		canvas.ctx.lineWidth = (squareWidth * 0.1) + 1;
		const fontSize = 16;
		canvas.ctx.font = fontSize + "px Rubik";

		// draw a rectangle around the affected letters
		const x1 = regions[i].start[0] * (squareWidth + squareGap);
		const y1 = regions[i].start[1] * (squareWidth + squareGap);
		const x2 = (regions[i].end[0] * (squareWidth + squareGap)) + squareWidth;
		const y2 = (regions[i].end[1] * (squareWidth + squareGap)) + squareWidth;

		const width = x2 - x1;
		const height = y2 - y1;

		roundRect(canvas.ctx, x1, y1, width, height, 5, false);

		// calculate position for the bubble
		let circX = x2;
		let circY = y1;
		const radius = 15;

		const onTopEdge = regions[i].start[1] === 0;
		const onRightEdge = regions[i].end[0] === 14;
		// move the bubble over if it is on an edge
		if (onRightEdge) {
			circX -= (radius);
		}
		if (onTopEdge) {
			circY += (radius);
		}

		// draw the bubble
		canvas.ctx.beginPath();
		canvas.ctx.arc(circX, circY, radius, 0, 2*Math.PI);
		canvas.ctx.fill();

		// draw the number on the bubble
		canvas.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(userTurn ? '--highlight-text' : '--semi-highlight-text');
		canvas.ctx.textAlign = "center";
		canvas.ctx.fillText(regions[i].points.toString(), circX, circY + (fontSize / 3));
		canvas.ctx.textAlign = "";
	}
}

// draw loop
// this function is run to draw each frame
function updateDisplay() {
	clearCanvas();
	drawBoard();
	drawLetterBank(game.letterBank);
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
	if (canvas.pointsPreview && !canvas.pointsPreview.hidden) {
		drawRegions([{points: canvas.pointsPreview.points, start: canvas.pointsPreview.start, end: canvas.pointsPreview.end}]);
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