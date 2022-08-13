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

	// make a list of what order different turns should be
	let currentPlayerIndex;
	for (var i = game.players.length - 1; i >= 0; i--) {
		if (game.players[i].id == account.id) {
			currentPlayerIndex = i;
			break;
		}
	}

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
	var bank = [];
	for (var i = 0; i < canvas.bank.length; i++) {
		if (!canvas.bank[i].hidden) {
			bank.push(canvas.bank[i]);
		}
	}

	// find where the board ends and the bank starts
	var width = canvas.c.width;
	var startY = width;
	var remainingSpace = canvas.c.height - startY;

	// draw title ("Letter Bank")
	var titleSize = 25;
	canvas.ctx.font = titleSize + "px Rubik";
	canvas.ctx.fillStyle = "#f2f5ff"; // tile text color
	canvas.ctx.textAlign = "center";
	canvas.ctx.fillText("Letter Bank", width / 2, startY + titleSize + 10);

	remainingSpace -= titleSize + 20;

	// determine some constants
	const numTiles = bank.length;
	const defaultTileGap = 5;
	const extraTileGap = 30;

	let totalGapSpace = 0;
	for (let i in bank.slice(0, -1)) {
		totalGapSpace += (bank[i].extraGapAfter ? extraTileGap : defaultTileGap);
	}

	const tileWidth = Math.min(remainingSpace - 10, ((width - totalGapSpace) / numTiles), 55);
	const startX = (width - ((tileWidth * numTiles) + totalGapSpace)) / 2;

	canvas.bankTileWidth = tileWidth;

	const textSize = tileWidth - 5;
	const smallTextSize = textSize / 3;

	let currentGapSpace = 0;

	canvas.dropZones = [];

	// draw each letter (we are using the bank without hidden letters)
	for (let i in bank) {
		let x = startX + (tileWidth * i) + currentGapSpace;
		let y = startY + titleSize + 20;
		
		// store the position of the tile for later use
		canvas.bank[bank[i].bankIndex].position.x = x;
		canvas.bank[bank[i].bankIndex].position.y = y;

		// calculate the position of the letter and points on the tile
		let textX = x + (tileWidth / 2);
		let textY = y + (tileWidth / 2) + (textSize / 3);

		let pointsX = x + (tileWidth * 0.9);
		let pointsY = y + (tileWidth * 0.9);

		// after calculating, increase the current gap space
		currentGapSpace += (bank[i].extraGapAfter ? extraTileGap : defaultTileGap);

		// draw tile
		canvas.ctx.fillStyle = "#a47449"; // tile brown
		roundRect(canvas.ctx, x, y, tileWidth, tileWidth);

		// if not blank
		if (bank[i].letter && bank[i].letter !== ".") {
			// draw letter
			canvas.ctx.fillStyle = "#f2f5ff" // tile text color
			canvas.ctx.font = textSize + "px Eurostile";
			canvas.ctx.textAlign = "center";
			canvas.ctx.fillText(bank[i].letter, textX, textY);

			// draw points
			let points = letterScores[bank[i].letter.toUpperCase()];

			canvas.ctx.font = smallTextSize + "px Eurostile";
			canvas.ctx.textAlign = "right";
			canvas.ctx.fillText(points, pointsX, pointsY);
		}

		// calculate drop zones for the letter bank
		const newZoneStartX = canvas.bank[i].position.x + (canvas.bankTileWidth / 2);
		const newZoneStartY = canvas.bank[i].position.y - (canvas.bankTileWidth / 5);
		const newZoneEndX = canvas.bank[i].position.x + (canvas.bankTileWidth * 1.5) + (bank[i].extraGapAfter ? extraTileGap : defaultTileGap);
		const newZoneEndY = canvas.bank[i].position.y + canvas.bankTileWidth + (canvas.bankTileWidth / 5);
		let newZone = {
			start: {
				x: newZoneStartX,
				y: newZoneStartY
			},
			end: {
				x: newZoneEndX,
				y: newZoneEndY
			},
			bankIndex: canvas.bank[i].bankIndex
		};
		canvas.dropZones.push(JSON.parse(JSON.stringify(newZone)));
	}
	
	for (let i in canvas.dropZones) {
		// draw drop zones for testing
		const zoneStartX = canvas.dropZones[i].start.x;
		const zoneStartY = canvas.dropZones[i].start.y;
		const width = canvas.dropZones[i].end.x - zoneStartX;
		const height = canvas.dropZones[i].end.y - zoneStartY;

		canvas.ctx.fillStyle = "#0000FF66";
		canvas.ctx.fillRect(zoneStartX, zoneStartY, width, height);

		canvas.ctx.strokeStyle = "#0000FF99";
		canvas.ctx.strokeRect(zoneStartX, zoneStartY, width, height);

		canvas.ctx.fillStyle = "#FFFFFF99";
		canvas.ctx.font = "10px Eurostile";
		canvas.ctx.textAlign = "left";
		canvas.ctx.fillText(bank[i].letter + ", " + bank[i].position.x, zoneStartX + 2, zoneStartY + 12);
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