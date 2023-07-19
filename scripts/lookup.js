/* function dictLookup(words, callback = function(entries) {}) {
	let entries = [];
	let promises = [
		...words.map(x => $.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + x, function(def) {
			entries.push(def);
		})),
		new Promise(function (resolve) {
			function res() {
				document.removeEventListener('mouseup', res);
				document.removeEventListener('touchend', res);
				resolve();
			}
			document.addEventListener('mouseup', res);
			document.addEventListener('touchend', res);
		})
	];

	Promise.allSettled(promises).then(() => {
		if (entries.length > 0) {
			callback(entries);
		}
	});
} */

function lookup(boardX, boardY, clientX, clientY) {
    let words = [];

    // start with x axis word
    let xWord = '';

    // sweep right
    let sweepX = boardX;
    while (game.board?.[boardY]?.[sweepX]) {
        xWord += game.board[boardY][sweepX].letter;
        sweepX++;
    }
    const sweepXMax = sweepX - 1;

    // sweep left
    sweepX = boardX - 1;
    while (game.board?.[boardY]?.[sweepX]) {
        xWord = game.board[boardY][sweepX].letter + xWord;
        sweepX--;
    }
    const sweepXMin = sweepX + 1;

    // add to words array
    if (xWord.length > 1) {
        words.push({
            word: xWord,
            pos: {
                start: [sweepXMin, boardY],
                end: [sweepXMax, boardY]
            }
        });
    }

    // then do y axis word
    let yWord = '';

    // sweep down
    let sweepY = boardY;
    while (game.board?.[sweepY]?.[boardX]) {
        yWord += game.board[sweepY][boardX].letter;
        sweepY++;
    }
    const sweepYMax = sweepY - 1;

    // sweep up
    sweepY = boardY - 1;
    while (game.board?.[sweepY]?.[boardX]) {
        yWord = game.board[sweepY][boardX].letter + yWord;
        sweepY--;
    }
    const sweepYMin = sweepY + 1;

    // add to words array
    if (yWord.length > 1) {
        words.push({
            word: yWord,
            pos: {
                start: [sweepYMin, boardY],
                end: [sweepYMax, boardY]
            }
        });
    }

    let content = ``;

    // for each word
    for (let i = 0; i < words.length; i++) {
        // find the word in the words list
        const word = words[i];
        const gameWord = game.words.find(a => 
            JSON.stringify(a.pos) === JSON.stringify(word.pos)
            && a.word.toUpperCase() === word.word.toUpperCase()
        );

        if (!gameWord) continue; // move on if the word can't be found

        content += `
            <div class="wordLookupEntry">
                <h3 class="wordLookupWord">
                    ${gameWord.word.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </h3>
                <div class="wordLookupInfo">
                    Played by <b>${gameWord.playerName}</b> for <b>${gameWord.points}</b> points
                </div>
                <a class="wordLookupLink flex fakeHoverLine" href="https://www.merriam-webster.com/dictionary/${gameWord.word}">
                    <span class="material-symbols-rounded smallIcon">search</span>
                    Look up
                </a>
            </div>
        `;
    }

    // add the content and show the popup
    $('#wordLookupPopup .wordLookupResults').html(content);
    $('#wordLookupPopup').popupOpen(clientX, clientY);
}