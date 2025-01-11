class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Move {
    /**
     * Creates an empty move object, which can hold words made on a specific turn by a specific player
     * @param {int} turn the game turn on which the move was made
     * @param {Player} player the player who made the move
     * @param {boolean} draft whether or not the move is a draft (styled with dotted border)
     */
    constructor(turn, player, draft = false) {
        this.isDraft = draft;
        this.turn = turn;
        this.player = player;
        this.words = [];
        this.points = 0;
    }

    /**
     * Adds a single word to the move object, putting non-cross words at the front
     * @param {Word} word the word to add
     */
    addWord(word) {
        if (word.cross) this.words.push(word);
        else            this.words.unshift(word);

        this.points += word.points || 0;
    }

    wasSkipped() {
        return this.words.length === 0;
    }
}

function getMovesArr(g) {
    // create an array full of empty moves
    let moves = new Array(g.turn);
    for (let i = 0; i < game.turn; i++) {
        const p = game.players[i % game.players.length];
        moves[i] = new Move(i, new Player(p.id, p.name), i === game.turn);
    }

    // sort the words into their respective moves
    for (let i = 0; i < g.words.length; i++) {
        const w = g.words[i];
        if (!moves[w.turn]) continue; // ignore words with invalid turns
        moves[w.turn].addWord(w);
    }

    return moves;
}

function updateMoveHistory(draftWords) {
    // get the moves array
    let moves = getMovesArr(game);

    // add the draft if it exists
    if (draftWords) {
        const draft = new Move(game.turn, game.players[game.turn % game.players.length], true);
        for (let i = 0; i < draftWords.length; i++) draft.addWord(draftWords[i]);
        moves[game.turn] = draft;
    }

    const historyEl = document.getElementById('historyContents');
    historyEl.innerHTML = "";

    // add the moves
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i];

        const wasSkipped = move.wasSkipped();
        const isDraft = !wasSkipped && !!move.isDraft;

        const moveEl = document.createElement('div');
        moveEl.className = "moveHistoryMove flex col flexStart gap10 flexGrow pointer" + (isDraft ? " moveHistoryDraft" : "");
        moveEl.id = "historyEntry" + i;
        moveEl.tabIndex = "0";
        if (!wasSkipped) moveEl.addEventListener('click', () => {
            setCanvasPage('canvas');
            setTimeout(() => {
                const word = move.words[0]; // non-cross words are in the front
                const region = word.pos;
                tempHighlight(region);
            }, 200);
        });
        if (wasSkipped) moveEl.style.cursor = "default";

        const moveTitle = document.createElement('span');
        moveTitle.className = "moveHistoryMoveTitle";
        moveTitle.innerHTML = /* html */ `
            <span class="finePrint">${isDraft ? `Draft` : `Turn ${i}`}</span>
            <br>
            <span>${move ? move.player.name : game.players[i % game.players.length].name}</span>
        `;
        moveEl.appendChild(moveTitle);
        
        const wordsEl = document.createElement('div');
        wordsEl.className = "flex col fullHeight gap2";

        if (!wasSkipped) {
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
        totalPointsEl.innerHTML = (wasSkipped ? "Skipped" : move.points + " point" + (move.points === 1 ? "" : "s"));
        if (wasSkipped) totalPointsEl.classList.add('textColorLight');
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