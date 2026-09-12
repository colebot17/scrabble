function lookup(boardX, boardY, clientX, clientY) {
    let words = [];

    // start with x axis word
    let xWord = '', unlockedTilesX = [];

    // sweep right
    let sweepX = boardX;
    while (game.board?.[boardY]?.[sweepX]) {
        const tile = game.board[boardY][sweepX];
        xWord += tile.letter;
        if (!tile.locked) unlockedTilesX.push(tile);
        sweepX++;
    }
    const sweepXMax = sweepX - 1;

    // sweep left
    sweepX = boardX - 1;
    while (game.board?.[boardY]?.[sweepX]) {
        const tile = game.board[boardY][sweepX];
        xWord = tile.letter + xWord;
        if (!tile.locked) unlockedTilesX.unshift(tile);
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
            axis: "x",
            unlockedTiles: unlockedTilesX
        });
    }

    // then do y axis word
    let yWord = '', unlockedTilesY = [];

    // sweep down
    let sweepY = boardY;
    while (game.board?.[sweepY]?.[boardX]) {
        const tile = game.board[sweepY][boardX];
        yWord += tile.letter;
        if (!tile.locked) unlockedTilesY.push(tile);
        sweepY++;
    }
    const sweepYMax = sweepY - 1;

    // sweep up
    sweepY = boardY - 1;
    while (game.board?.[sweepY]?.[boardX]) {
        const tile = game.board[sweepY][boardX]
        yWord = tile.letter + yWord;
        if (!tile.locked) unlockedTilesY.push(tile);
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
            axis: "y",
            unlockedTiles: unlockedTilesY
        });
    }

    const resultsEl = document.querySelector("#wordLookupPopup .wordLookupResults");
    resultsEl.innerHTML = "";

    // for each word
    for (let i = 0; i < words.length; i++) {
        // find the word in the words list
        const word = words[i];
        const gameWord = game.words.find(a => 
            a.pos.start[0] === word.pos.start[0] && a.pos.start[1] === word.pos.start[1]
            && a.pos.end[0] === word.pos.end[0] && a.pos.end[1] === word.pos.end[1]
        );

        // add a divider between multiple words
        if (i !== 0) resultsEl.innerHTML += `<hr class="lookupDivider">`;

        const w = gameWord?.word || word.word;

        resultsEl.innerHTML += `
            <div class="wordLookupEntry">
                <h3 class="wordLookupWord narrowHeading">
                    ${w.toTitleCase()}
                </h3>
                <div class="wordLookupInfo" id="lookupInfo${i}">
                    ${!word.unlockedTiles.length ?
                        (gameWord ? `Played by <b>${gameWord.playerName}</b> for <b>${gameWord.points}</b> points` : `Word not found`)
                        : `Checking Validity...`}
                </div>
                <div class="flex gap10">
                    ${!word.unlockedTiles.length && gameWord ? `
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

        // if a word is a draft, look it up (asynchronously)
        if (word.unlockedTiles.length) {
            parseWords(game, word.unlockedTiles).then(words => {
                const el = document.getElementById("lookupInfo" + i);
                if (!words.length) {
                    el.innerHTML = "Invalid Move";
                } else {
                    let totalPts = 0;
                    for (const wo of words) totalPts += wo.points;
                    el.innerHTML = "Valid Move: <b>" + totalPts + "</b> points";
                }
            }).catch(() => {
                const el = document.getElementById("lookupInfo" + i);
                el.innerHTML = "Error checking word";
                el.style.color = "red";
            });

        }
    }

    // show the popup
    $('#wordLookupPopup').popupOpen(clientX, clientY);
}