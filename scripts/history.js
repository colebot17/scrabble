function updateMoveHistory(draft) {
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
                isDraft: false,
                turn: turn,
                player: game.words[i].player,
                playerName: game.words[i].playerName,
                words: [game.words[i]],
                points: game.words[i].points
            };
        }
    }

    // add the draft if it exists
    if (draft) {
        moves[game.turn] = {
            isDraft: true,
            turn: game.turn,
            player: account.id,
            playerName: account.name,
            words: draft.newWords,
            points: draft.newPoints
        };
    }

    historyEl.innerHTML = "";

    // add the moves
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i];

        const isSkipped = !move; // any gap in moves is assumed to be a skipped turn

        const isDraft = !isSkipped && !!move.isDraft;

        const moveEl = document.createElement('div');
        moveEl.className = "moveHistoryMove flex col flexStart gap10 flexGrow pointer" + (isDraft ? " moveHistoryDraft" : "");
        moveEl.id = "historyEntry" + i;
        moveEl.tabIndex = "0";
        moveEl.addEventListener('click', () => {
            setCanvasPage('canvas');
            setTimeout(() => {
                const word = move.words.find(a => a.cross === false);
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
            <span class="finePrint">${isDraft ? `Draft` : `Turn ${i}`}</span>
            <br>
            <span>${move ? move.playerName : game.players[i % game.players.length].name}</span>
        `;
        moveEl.appendChild(moveTitle);
        
        const wordsEl = document.createElement('div');
        wordsEl.className = "flex col fullHeight gap2";

        if (!isSkipped) {
            const words = move.words;
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                if (!word.placeholder) {
                    const wordEl = document.createElement('div');
                    wordEl.className = "moveHistoryWord";
                    wordEl.innerHTML = "<span class='bold'>" + word.word.toTitleCase() + "</span>" + (words.length > 1 ? " - " + word.points + "pt" + (word.points === 1 ? "" : "s") : "");
                    wordsEl.appendChild(wordEl);
                } else {
                    const bonusEl = document.createElement('div');
                    bonusEl.className = "moveHistoryWord flex";
                    bonusEl.innerHTML = "<span class='material-symbols-rounded smallIcon'>add_circle</span><span>" + word.points + " point" + (word.points === 1 ? "" : "s") + "</span>";
                    bonusEl.title = "The player used all 7 of their letters in this single turn.";
                    wordsEl.appendChild(bonusEl);
                }
            }
        } else {
            wordsEl.innerHTML = "--";
            wordsEl.classList.add('textColorLight');
        }

        moveEl.appendChild(wordsEl);

        const totalPointsEl = document.createElement('div');
        totalPointsEl.innerHTML = (isSkipped ? "Skipped" : move.points + " point" + (move.points === 1 ? "" : "s"));
        if (isSkipped) totalPointsEl.classList.add('textColorLight');
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
            if (canvas.movesAnimating) {
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