function dictLookup(words, callback = function(entries) {}) {
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
}

function lookupWord(boardX, boardY, clientX, clientY) {
    // start with x axis word
    // sweep left and right
    let sweepX = boardX;
    let xWord = '';
    while (game.board?.[boardY]?.[sweepX]) {
        xWord += game.board[boardY][sweepX].letter;
        sweepX++;
    }
    sweepX = boardX - 1;
    while (game.board?.[boardY]?.[sweepX]) {
        xWord = game.board[boardY][sweepX].letter + xWord;
        sweepX--;
    }

    // then do y axis word
    let sweepY = boardY;
    let yWord = '';
    while (game.board?.[sweepY]?.[boardX]) {
        yWord += game.board[sweepY][boardX].letter;
        sweepY++;
    }
    sweepY = boardY - 1;
    while (game.board?.[sweepY]?.[boardX]) {
        yWord = game.board[sweepY][boardX].letter + yWord;
        sweepY--;
    }

    let words = [];
    if (xWord.length > 1) {
        words.push(xWord);
    }
    if (yWord.length > 1) {
        words.push(yWord);
    }

    dictLookup(words, function(entries) {
        let content = ``;
        for (let i in entries) {
            const v = entries[i][0];
            content += `
                <div class="wordLookupEntry">
                    <div class="wordLookupWord">
                        <a title="View on Merriam-Webster" href="https://www.merriam-webster.com/dictionary/${v.word}" class="blue hoverLine" target="_blank">
                            ${v.word.replace(/^\w/, (c) => c.toUpperCase())}
                        </a>
                    </div>
                    <div class="wordLookupDefinitions">
            `;
            for (let j in v.meanings) {
                const w = v.meanings[j];
                for (let k in w.definitions) {
                    const x = w.definitions[k];
                    content += `
                        <div class="definition">
                            <b>${w.partOfSpeech.replace(/^\w/, (c) => c.toUpperCase())}</b>: ${x.definition}
                        </div>
                    `;
                }
            }
            content += `
                    </div>
                </div>
            `;
        }
        $('#wordLookupPopup .wordLookupResults').html(content);
        $('#wordLookupPopup').popupOpen(clientX, clientY);
    });
}