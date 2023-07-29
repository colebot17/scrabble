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
        const moveEl = document.createElement('div');
        moveEl.className = "moveHistoryMove flex col flexGrow";

        const moveTitle = document.createElement('span');
        moveTitle.className = "moveHistoryMoveTitle bold";
        moveTitle.innerHTML = /* html */ `
            <span class="finePrint">Move ${moves[i].turn}</span>
            <br>
            <span class="bold">${moves[i].playerName}</span>
        `;
        moveEl.appendChild(moveTitle);
        
        const words = moves[i].words;
        for (let j = 0; j < words.length; j++) {
            const wordEl = document.createElement('div');
            wordEl.className = "moveHistoryWord";
            wordEl.innerHTML = words[j].word + " - " + words[j].points + "pts";
            moveEl.appendChild(wordEl);
        }

        historyEl.appendChild(moveEl);
    }
}