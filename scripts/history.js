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
        moveEl.id = "historyEntry" + moves[i].turn;
        moveEl.tabIndex = "0";
        moveEl.addEventListener('click', () => {
            setCanvasPage('canvas');
            setTimeout(() => {
                const word = moves[i].words.find(a => a.cross === false);
                const region = {
                    start: [
                        word.pos.start[0],
                        word.pos.start[1]
                    ],
                    end: [
                        word.pos.end[0],
                        word.pos.end[1]
                    ]
                }
                tempHighlight(region);
            }, 200);
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
            if (!words[j].placeholder) {
                const wordEl = document.createElement('div');
                wordEl.className = "moveHistoryWord";
                wordEl.innerHTML = "<span class='bold'>" + words[j].word.toTitleCase() + "</span>" + (words.length > 1 ? " - " + words[j].points + "pts" : "");
                wordsEl.appendChild(wordEl);
            } else {
                const bonusEl = document.createElement('div');
                bonusEl.className = "moveHistoryWord flex";
                bonusEl.innerHTML = "<span class='material-symbols-rounded smallIcon'>add_circle</span><span>" + words[j].points + " points</span>";
                bonusEl.title = "The player used all 7 of their letters in this single turn.";
                wordsEl.appendChild(bonusEl);
            }
        }

        moveEl.appendChild(wordsEl);

        const totalPointsEl = document.createElement('div');
        totalPointsEl.innerHTML = moves[i].points + " points";
        moveEl.appendChild(totalPointsEl);

        historyEl.appendChild(moveEl);
    }

    const playEl = document.getElementById('playMoveAnimationButton');
    if (moves.length === 0) {
        historyEl.innerHTML = "When a player makes a move, it will appear here.";
        playEl.disabled = true;
    } else {
        playEl.disabled = false;
    }
}

function highlightHistoryEntry(turn) {
    setCanvasPage('history');
    $('#wordLookupPopup').popupClose();

    const entry = document.getElementById('historyEntry' + turn);

    entry.scrollIntoView();

    setTimeout(() => {
        entry.style.backgroundColor = "var(--text-highlight)";
        setTimeout(() => {
            entry.style.transition = "background-color 1s";
            entry.style.backgroundColor = "";
            setTimeout(() => {
                entry.style.transition = "";
            }, 1000);
        }, 2000);
    }, 200);
}

function moveHistoryButtonPress() {
    const btn = document.getElementById('moveHistoryButton');
    const btnMode = btn.dataset.btnmode;

    // modes: history (default), stop, crossword (game)

    if (btnMode === "history" || !btnMode) {
        setCanvasPage('history');
    } else if (btnMode === "stop") {
        stopAnimatingMoves();
    } else if (btnMode === "crossword") {
        setCanvasPage('canvas');
    }
}

function setHistoryButtonMode(mode) {
    const btn = document.getElementById('moveHistoryButton');
    const icon = document.querySelector('#moveHistoryButton span');

    if (mode[0] === "%") {
        if (mode === "%auto") {
            const ccp = document.getElementById('canvasCanvasPage');
            mode = ccp.classList.contains('hidden') ? 'crossword' : 'history';
            if (canvas.animatingMoves) {
                mode = "stop";
            }
        }
    }

    btn.dataset.btnmode = mode;
    icon.innerHTML = mode;
}

function listeners() {
    document.getElementById('moveHistoryButton').addEventListener('click', moveHistoryButtonPress);
}
listeners();