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
            },
            axis: "x"
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
                start: [boardX, sweepYMin],
                end: [boardX, sweepYMax]
            },
            axis: "y"
        });
    }

    let content = ``;

    // for each word
    for (let i = 0; i < words.length; i++) {
        // find the word in the words list
        const word = words[i];
        const gameWord = game.words.find(a => 
            JSON.stringify(a.pos) === JSON.stringify(word.pos)
            && a.word?.toUpperCase() === word.word?.toUpperCase()
        );

        if (i !== 0) {
            content += `<hr class="lookupDivider">`;
        }

        const w = gameWord?.word || word.word;

        content += `
            <div class="wordLookupEntry">
                <h3 class="wordLookupWord narrowHeading">
                    ${w.toTitleCase()}
                </h3>
                <div class="wordLookupInfo" id="lookupInfo${i}">
                    ${gameWord ?
                        `Played by <b>${gameWord.playerName}</b> for <b>${gameWord.points}</b> points`
                        : `Checking Validity...`}
                </div>
                <div class="flex gap10">
                    ${gameWord ? `
                        <a class="flex blue fakeHoverLine pointer" onclick="highlightHistoryEntry(${gameWord.turn})">
                            <span class="material-symbols-rounded smallIcon">info</span>
                            More Info
                        </a>
                    ` : ``}
                    <a class="wordLookupLink flex blue fakeHoverLine" href="${langInfo[game.lang].dictionaryAddress + w.toLowerCase()}" target="_blank">
                        <span class="material-symbols-rounded smallIcon">search</span>
                        Look up
                    </a>
                </div>
            </div>
        `;

        if (!gameWord) {
            // send a request to get the points for just this word

            // gather all unlocked tiles in the region
            let tiles = [];
            if (word.axis === "x") {
                const boardY = word.pos.start[1];
                let sweepX = word.pos.start[0];

                while (game.board[boardY][sweepX]) {
                    if (!game.board[boardY][sweepX].locked) {
                        tiles.push(game.board[boardY][sweepX]);
                    }
                    sweepX++;
                }
            }

            if (word.axis === "y") {
                const boardX = word.pos.start[0];
                let sweepY = word.pos.start[1];

                while (game.board[sweepY][boardX]) {
                    if (!game.board[sweepY][boardX].locked) {
                        tiles.push(game.board[sweepY][boardX]);
                    }
                    sweepY++;
                }
            }

            request('checkPoints.php', {
                game: game.id,
                tiles: JSON.stringify(tiles),
                user: account.id,
                pwd: account.pwd
            }).then(res => {
                // we are making the assumption that the entire for loop (i) is
                // done and the DOM is ready by the time this request completes
                const el = document.getElementById('lookupInfo' + i);
                if (res.errorLevel) {
                    el.innerHTML = "Invalid Move";
                } else {
                    el.innerHTML = "Valid Move: <b>" + res.data.newPoints + "</b> points";
                }
            }).catch(() => {
                const el = document.getElementById('lookupInfo' + i);
                el.innerHTML = !navigator.onLine ? "No Connection" : "Error checking word";
                el.style.color = "red";
            })
        }
    }

    // add the content and show the popup
    $('#wordLookupPopup .wordLookupResults').html(content);
    $('#wordLookupPopup').popupOpen(clientX, clientY);
}