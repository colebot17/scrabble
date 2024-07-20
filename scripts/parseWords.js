export async function parseWords(g) {
    // make sure all tiles are connected
    if (!checkConnectedness(g.board)) return false;

    // get a list of all changed tiles
    const tiles = getUnlockedTiles(g.board);

    // get the axis for the word
    const axis = determineAxis(tiles, g.board);

    // make sure the tiles are in a straight line
    if (!axis) return false;

    // make sure we have the info we need
    const [dict, bInfo, lInfo] = await lazyLoadInfo(g.lang);

    // sweep the correct axis
    let words;
    if (axis === "horizontal") {
        words = sweepX(tiles, g.board, bInfo, lInfo);
    } else if (axis === "vertical") {
        words = sweepY(tiles, g.board, bInfo, lInfo);
    }

    // check word validity
    for (let i = 0; i < words.length; i++) {
        if (!dict.includes(words[i].word.toLowerCase())) {
            return false;
        }
    }

    // add the bonus 50 points if the user used all letters
    if (tiles.length === 7) {
        words.push({points: 50, placeholder: true});
    } else if (tiles.legnth > 7) {
        return false;
    }

    return words;
}

export function getUnlockedTiles(b) {
	// returns a simplified list of any unlocked tiles on the board
	var newTiles = [];
	for (let y in b) {
		for (let x in b[y]) {
			if (b[y][x] && !b[y][x].locked) {
				let tile = b[y][x];
				newTiles.push({
					bankIndex: tile.bankIndex,
					blank: tile.blank,
					letter: tile.letter,
					x: tile.x,
					y: tile.y
				});
			}
		}
	}
	return newTiles;
}

export function checkConnectedness(b) {
	// returns true if all tiles on the board are connected to the center
	// returns false if not
	//
	// using a four-way flood fill algorithm with a queue

	// make a copy of the board that is simpler
	let boardCopy = [];
	for (let y = 0; y < b.length; y++) {
		let rowCopy = [];
		for (let x = 0; x < b[y].length; x++) {
			rowCopy.push(!!b[y][x] ? "tile" : "empty");
		}
		boardCopy.push(rowCopy);
	}

	// create a queue
	let queue = [];
	queue.push([7, 7]); // start with the center tile

	// go through the queue
	while (queue.length > 0) {
		let [x, y] = queue.shift();

		// this item is in the queue, so it must be connected
		boardCopy[y][x] = "connected";

		// add all adjacent tiles to the queue as well
		if (boardCopy?.[y]?.[x + 1] === "tile") {
			queue.push([x + 1, y]);
		}
		if (boardCopy?.[y]?.[x - 1] === "tile") {
			queue.push([x - 1, y]);
		}
		if (boardCopy?.[y + 1]?.[x] === "tile") {
			queue.push([x, y + 1]);
		}
		if (boardCopy?.[y - 1]?.[x] === "tile") {
			queue.push([x, y - 1]);
		}
	}

	// now go through the copy and see if we missed any "tile"s
	for (let y = 0; y < boardCopy.length; y++) {
		for (let x = 0; x < boardCopy[y].length; x++) {
			if (boardCopy[y][x] === "tile") {
				return false;
			}
		}
	}
	return true;
}

// determine what axis a set of tiles is on
// returns "horizontal", "vertical", or false
function determineAxis(tiles, board) {
    if (tiles.length === 0) return false;

    const xs = [];
    const ys = [];
    for (let i = 0; i < tiles.length; i++) {
        xs.push(tiles[i].x);
        ys.push(tiles[i].y);
    }
    let vertical = true;
    for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== xs[0]) {
            vertical = false;
            break;
        }
    }
    let horizontal = true;
    for (let i = 0; i < ys.length; i++) {
        if (ys[i] !== ys[0]) {
            horizontal = false;
            break;
        }
    }

    if (!horizontal && !vertical) return false;

    // prevent axis confusion
    if (horizontal && vertical) {
        // detect tiles around the tile
        const sideToSide = board[tiles[0].y][tiles[0].x + 1] || board[tiles[0].y][tiles[0].x - 1];
        const upAndDown = board[tiles[0].y - 1][tiles[0].x] || board[tiles[0].y - 1][tiles[0].x];

        // there is a slight preference here towards the horizontal axis
        // in a perfect world we would count the number of tiles around the tile (but we're lazy)
        if (sideToSide) {
            return "horizontal";
        } else if (upAndDown) {
            return "vertical";
        }
    }

    if (horizontal && !vertical) return "horizontal";

    if (vertical && !horizontal) return "vertical";

    return false;
}

let dictionary = {}, boardInfo, langInfo;
async function lazyLoadInfo(lang) {
    return Promise.all([lazyLoadDict(lang), lazyLoadBoardInfo(), lazyLoadLangInfo(lang)]);
}
async function lazyLoadDict(lang) {
    if (dictionary[lang]) return dictionary[lang].words;

    // send a request to get the dictionary for the specified language
    const res = await fetch('../resources/dictionary_' + lang + '.json');
    if (!res.ok) {
        throw new Error("HTTP Error: " + res.status);
    };
    const dict = await res.json();
    dictionary[lang] = dict;
    return dict.words;
}
async function lazyLoadBoardInfo() {
    if (boardInfo) return boardInfo;

    const res = await fetch('../resources/board.json');
    if (!res.ok) {
        throw new Error("HTTP Error: " + res.status);
    }
    boardInfo = await res.json();
    return boardInfo;
}
async function lazyLoadLangInfo(lang) {
    if (langInfo) return langInfo[lang];

    const res = await fetch('../resources/languages.json');
    if (!res.ok) {
        throw new Error("HTTP Error: " + res.status);
    }
    langInfo = await res.json();
    return langInfo[lang];
}

function sweepX(tiles, board, bInfo, lInfo) {
    const x = tiles[0].x;
    const y = tiles[0].y;

    let words = [];

    let xAxisWord = "";
    let xAxisWordPoints = 0;
    let xAxisWordMultiplier = 1;

    let sweepXMin = x;
    let sweepXMax = x;

    for (let i = 0; i < 2; i++) {
        let sweepX = i ? x - 1 : x;

        let tile;
        while (tile = board[y]?.[sweepX]) {
            const letter = tile.letter.toUpperCase();
            xAxisWord = i ? letter + xAxisWord : xAxisWord + letter;

            if (!tile.blank) {
                let newPoints = lInfo.letterScores[letter];
                if (!tile.locked) newPoints *= bInfo.scoreMultipliers[bInfo.modifiers[y][sweepX]].letter;
                xAxisWordPoints += newPoints;
            }

            if (!tile.locked) {
                xAxisWordMultiplier *= bInfo.scoreMultipliers[bInfo.modifiers[y][sweepX]].word;

                // sweep the cross axis
                let xCrossAxisWord = "";
                let xCrossAxisWordPoints = 0;
                let xCrossAxisWordMultiplier = 1;

                let sweepYMin = y;
                let sweepYMax = y;

                for (let j = 0; j < 2; j++) {
                    let sweepY = j ? y - 1 : y;

                    let crossTile;
                    while (crossTile = board[sweepY]?.[sweepX]) {
                        const letter = crossTile.letter.toUpperCase();
                        xCrossAxisWord = j ? letter + xCrossAxisWord : xCrossAxisWord + letter;

                        if (!crossTile.blank) {
                            let newCrossPoints = lInfo.letterScores[letter];
                            if (!crossTile.locked) newCrossPoints *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][sweepX]].letter;
                            xCrossAxisWordPoints += newCrossPoints;
                        }

                        if (!crossTile.locked) xCrossAxisWordMultiplier *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][sweepX]].word;

                        j ? sweepY-- : sweepY++;
                    }

                    // store the min and max so we know the position of the cross word
                    if (j) {
                        sweepYMin = sweepY + 1; // sweeping up, store min
                    } else {
                        sweepYMax = sweepY - 1; // sweeping down, store max
                    }
                }

                // compile the x cross axis word and points into the array
                if (!lInfo.alphabet.includes(xCrossAxisWord)) {
                    words.push({
                        word: xCrossAxisWord,
                        points: xCrossAxisWordPoints * xCrossAxisWordMultiplier,
                        axis: "y",
                        cross: true,
                        pos: {
                            start: [sweepX, sweepYMin],
                            end: [sweepX, sweepYMax]
                        }
                    });
                }
            }

            i ? sweepX-- : sweepX++;
        }

        if (i) {
            // sweeping right, store min
            sweepXMin = sweepX + 1;
        } else {
            // sweeping left, store max
            sweepXMax = sweepX - 1;
        }
    }

    // compile the x axis word and points into the array
    if (!lInfo.alphabet.includes(xAxisWord)) {
        words.push({
            word: xAxisWord,
            points: xAxisWordPoints * xAxisWordMultiplier,
            axis: "x",
            cross: false,
            pos: {
                start: [sweepXMin, y],
                end: [sweepXMax, y]
            }
        });
    }

    return words;
}

function sweepY(tiles, board, bInfo, lInfo) {
    const x = tiles[0].x;
    const y = tiles[0].y;

    let words = [];

    let yAxisWord = "";
    let yAxisWordPoints = 0;
    let yAxisWordMultiplier = 1;

    let sweepYMin = y;
    let sweepYMax = y;

    for (let i = 0; i < 2; i++) {
        let sweepY = i ? y - 1 : y;

        let tile;
        while (tile = board[sweepY]?.[x]) {
            const letter = tile.letter.toUpperCase();
            yAxisWord = i ? letter + yAxisWord : yAxisWord + letter;

            if (!tile.blank) {
                let newPoints = lInfo.letterScores[letter];
                if (!tile.locked) newPoints *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][x]].letter;
                yAxisWordPoints += newPoints;
            }

            if (!tile.locked) {
                yAxisWordMultiplier *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][x]].word;

                // sweep the cross axis
                let yCrossAxisWord = "";
                let yCrossAxisWordPoints = 0;
                let yCrossAxisWordMultiplier = 1;

                let sweepXMin = x;
                let sweepXMax = x;

                for (let j = 0; j < 2; j++) {
                    let sweepX = j ? x - 1 : x;

                    let crossTile;
                    while (crossTile = board[sweepY]?.[sweepX]) {
                        const letter = crossTile.letter.toUpperCase();
                        yCrossAxisWord = j ? letter + yCrossAxisWord : yCrossAxisWord + letter;

                        if (!crossTile.blank) {
                            let newCrossPoints = lInfo.letterScores[letter];
                            if (!crossTile.locked) newCrossPoints *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][sweepX]].letter;
                            yCrossAxisWordPoints += newCrossPoints;
                        }

                        if (!crossTile.locked) yCrossAxisWordMultiplier *= bInfo.scoreMultipliers[bInfo.modifiers[sweepY][sweepX]].word;

                        j ? sweepX-- : sweepX++;
                    }

                    // store the min and max so we know the position of the cross word
                    if (j) {
                        sweepXMin = sweepX + 1; // sweeping left, store min
                    } else {
                        sweepXMax = sweepX - 1; // sweeping right, store max
                    }
                }

                // compile the y cross axis word and points into the array
                if (!lInfo.alphabet.includes(yCrossAxisWord)) {
                    words.push({
                        word: yCrossAxisWord,
                        points: yCrossAxisWordPoints * yCrossAxisWordMultiplier,
                        axis: "x",
                        cross: true,
                        pos: {
                            start: [sweepXMin, sweepY],
                            end: [sweepXMax, sweepY]
                        }
                    });
                }
            }

            i ? sweepY-- : sweepY++;
        }

        if (i) {
            // sweeping up, store min
            sweepYMin = sweepY + 1;
        } else {
            // sweeping down, store max
            sweepYMax = sweepY - 1;
        }
    }

    // compile the y axis word and points into the array
    if (!lInfo.alphabet.includes(yAxisWord)) {
        words.push({
            word: yAxisWord,
            points: yAxisWordPoints * yAxisWordMultiplier,
            axis: "y",
            cross: false,
            pos: {
                start: [x, sweepYMin],
                end: [x, sweepYMax]
            }
        });
    }

    return words;
}