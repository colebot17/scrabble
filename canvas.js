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
	if (canvas.interval) {clearInterval(canvas.interval)}
	canvas.interval = setInterval(updateDisplay, 20);

	// surely there is a better way but we'll just loop back through the players to find the player's last turn
	let playerLastTurn = game.turn - 1;
	while (game.players?.[playerLastTurn % game.players.length]?.id != account.id && playerLastTurn > -1) {
		playerLastTurn--;
	}

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

	// handle window resize
	window.onresize = setCanvasSize;
}

function setCanvasSize() {
	const canvasCell = $('#canvasCell');

	// hide the canvas first (to let the grid adjust properly)
	canvas.c.style.display = "none";
	
	// get the dimensions that we have to work with
	const canvasCellWidth = canvasCell.width();
	const canvasCellHeight = canvasCell.height();

	// calculate which dimension will limit the size
	var limitingDimension = Math.min(canvasCellWidth + 100, canvasCellHeight);

	// size the canvas accordingly
	canvas.c.width = limitingDimension - 100;
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
	let fontSize = squareWidth - 25;
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

			// if size permits, show the board multiplier strings
			if (squareWidth >= 35 && boardMultiplierStrings[boardModifiers[y][x]]) {
				canvas.ctx.font = fontSize + "px Rubik";
				canvas.ctx.fillStyle = "#f2f5ff";
				canvas.ctx.textAlign = "center";
				canvas.ctx.fillText(boardMultiplierStrings[boardModifiers[y][x]], (x * squareWidth) + (x * squareGap) + (squareWidth / 2), (y * squareWidth) + (y * squareGap) + (squareWidth / 2) + (fontSize / 2));
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
	const titleSize = 25;
	canvas.ctx.font = titleSize + "px Rubik";
	canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
	canvas.ctx.textAlign = "center";
	canvas.ctx.fillText("Letter Bank", canvasWidth / 2, startY + titleSize + 10);

	remainingSpace -= titleSize + 20;

	// determine some constants
	const numTiles = bank.length;
	const defaultTileGap = 5;
	const extraTileGap = 30;

	let totalGapSpace = 0;
	for (let i in bank) {
		totalGapSpace += (bank[i].extraGapAfter ? extraTileGap : defaultTileGap);
	}
	if (canvas.extraGapBeforeBank) {
		totalGapSpace -= extraTileGap - defaultTileGap;
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
		// add the first drop zone
		canvas.dropZones = [{
			start: {
				x: firstLetter.position.x - (canvas.extraGapBeforeBank ? extraTileGap : defaultTileGap) - (canvas.bankTileWidth / 2),
				y: firstLetter.position.y - (canvas.bankTileWidth / 5)
			},
			end: {
				x: firstLetter.position.x + (canvas.bankTileWidth / 2),
				y: firstLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
			},
			bankIndex: 0
		}];
	} else {
		canvas.dropZones = []; // initialize no drop zones because there are no visible letters in the bank
	}

	// draw each letter
	let drawnLetters = 0;
	for (let i in canvas.bankOrder) {
		const canvasLetter = canvas.bank[canvas.bankOrder[i]];

		// don't display the letter if it is hidden
		if (canvasLetter.hidden) {
			continue;
		}

		// calculate where to start
		const x = startX + (tileWidth * drawnLetters) + currentGapSpace;
		const y = startY + titleSize + 20;
		
		// store the position of the tile for later use
		canvasLetter.position.x = x;
		canvasLetter.position.y = y;

		// calculate the position of the letter and points on the tile
		const textX = x + (tileWidth / 2);
		const textY = y + (tileWidth / 2) + (textSize / 3);

		const pointsX = x + (tileWidth * 0.9);
		const pointsY = y + (tileWidth * 0.9);

		// after calculating, increase the current gap space
		currentGapSpace += (canvasLetter.extraGapAfter ? extraTileGap : defaultTileGap);

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
				x: canvasLetter.position.x + (canvas.bankTileWidth * 1.5) + (canvasLetter.extraGapAfter ? extraTileGap : defaultTileGap),
				y: canvasLetter.position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5)
			},
			bankIndex: canvasLetter.bankIndex + 1
		};
		canvas.dropZones.push(newZone);

		drawnLetters++;
	}
}

function updateTile(tile) {
	// figure out animiation stuff
	var tileSize = (tile.size === undefined ? 1 : tile.size);

	var tileWidth = squareWidth * tileSize;
	var fontSize = Math.max(tileWidth - 10, 0);

	var pixelX = (tile.pixelX + (tile.mouseOffset?.x || -(squareWidth / 2)) || (tile.x * squareWidth) + (tile.x * squareGap)) + ((squareWidth - tileWidth) / 2);
	var pixelY = (tile.pixelY + (tile.mouseOffset?.y || -(squareWidth / 2)) || (tile.y * squareWidth) + (tile.y * squareGap)) + ((squareWidth - tileWidth) / 2);

	// draw the tile
	canvas.ctx.fillStyle = (tile.locked ? "#a47449" : "#a47449cc"); // tile brown
	roundRect(canvas.ctx, pixelX, pixelY, tileWidth, tileWidth, 5);

	// draw the letter on the tile
	if (tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff66"; // tile text color but transparent
	} else {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
	}
	canvas.ctx.font = fontSize + "px Eurostile";
	canvas.ctx.textAlign = "center";
	canvas.ctx.fillText(tile.letter, pixelX + (tileWidth / 2), pixelY + fontSize);

	// draw the points on the tile if size allows
	if (squareWidth >= 35 && !tile.blank) {
		canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
		canvas.ctx.font = (fontSize / 3) + "px Eurostile";
		canvas.ctx.textAlign = "right";
		canvas.ctx.fillText(letterScores[tile.letter], (pixelX + (tileWidth * 0.9)), (pixelY + (tileWidth * 0.9)));
	}
}

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
	if (dragged) {
		updateTile(dragged);
	}
}

// from https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
// draws a rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
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
	ctx.fill();
}