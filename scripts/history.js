function updateMoveHistory() {
    const historyEl = document.getElementById('historyContents');

    // generate a moves array
    let moves = [];
    for (let i = 0; i < game.words.length; i++) {
        const turn = game.words[i].turn;
        if (moves[turn]) {
            moves[turn].words.push(game.words[i]);
            moves[turn].points += game.words[i].points;
        } else {
            moves[turn] = {
                turn: turn,
                player: game.words[i].player,
                playerName: game.words[i].playerName,
                words: [game.words[i]],
                points: game.words[i].points
            };
        }
    }

    historyEl.innerHTML = "";
    for (let i = moves.length - 1; i >= 0; i--) {
        if (!moves[i]) continue; // there may be gaps in the moves array due to players skipping turns

        const moveEl = document.createElement('div');
        moveEl.className = "moveHistoryMove flex col flexStart gap10 flexGrow pointer";
        moveEl.tabIndex = "0";
        moveEl.addEventListener('click', () => {
            setCanvasPage('canvas');
            setTimeout(() => {
                tempHighlight(moves[i].words.find(a => a.cross === false).pos);
            }, 370);
        })

        const moveTitle = document.createElement('span');
        moveTitle.className = "moveHistoryMoveTitle";
        moveTitle.innerHTML = /* html */ `
            <span class="finePrint">Turn ${moves[i].turn}</span>
            <br>
            <span>${moves[i].playerName}</span>
        `;
        moveEl.appendChild(moveTitle);
        
        const wordsEl = document.createElement('div');
        wordsEl.className = "flex col fullHeight gap2";

        const words = moves[i].words;
        for (let j = 0; j < words.length; j++) {
            const wordEl = document.createElement('div');
            wordEl.className = "moveHistoryWord";
            wordEl.innerHTML = "<span class='bold'>" + words[j].word.toTitleCase() + "</span>" + (words.length > 1 ? " - " + words[j].points + "pts" : "");
            wordsEl.appendChild(wordEl);
        }

        moveEl.appendChild(wordsEl);

        const totalPointsEl = document.createElement('div');
        totalPointsEl.innerHTML = moves[i].points + " points";
        moveEl.appendChild(totalPointsEl);

        historyEl.appendChild(moveEl);
    }
}