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
        moveEl.className = "moveHistoryMove flex col flexStart gap10 flexGrow";

        const moveTitle = document.createElement('span');
        moveTitle.className = "moveHistoryMoveTitle bold";
        moveTitle.innerHTML = /* html */ `
            <span class="finePrint">Move ${moves[i].turn}</span>
            <br>
            <span class="bold">${moves[i].playerName}</span>
        `;
        moveEl.appendChild(moveTitle);
        
        const wordsEl = document.createElement('div');
        wordsEl.className = "flex col fullHeight gap2";

        const words = moves[i].words;
        for (let j = 0; j < words.length; j++) {
            const wordEl = document.createElement('div');
            wordEl.className = "moveHistoryWord";
            wordEl.innerHTML = words[j].word + " - " + words[j].points + "pts";
            wordsEl.appendChild(wordEl);
        }

        moveEl.appendChild(wordsEl);

        if (moves[i].words.length > 1) {
            const totalPointsEl = document.createElement('div');
            totalPointsEl.className = "bold";
            totalPointsEl.innerHTML = moves[i].points + " points";
            moveEl.appendChild(totalPointsEl);
        }

        historyEl.appendChild(moveEl);
    }
}