function checkParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        const gameId = parseInt(params.get('game'));

        // make sure the game id is a number
        if (isNaN(gameId)) {
            textModal("Invalid game id", "The url-specified game is not a valid game id. Check your link and try again.");
            return;
        }

        openGame(gameId);
    }

    if (params.has('tab')) {
        const tab = params.get('tab');
        if (tab === 'friends') {
            showTab('friends');
        }
    }
}

function openGame(gameId) {
    // logical flow to find the game
        
    const gameFindError = () => textModal("Game not found", "You are trying to load a game that you don't have access to. Sign in to the correct account to access game <b>#" + gameId + "</b>.");

    // does the game exist in the current account?
    const inCurrentAccount = account?.games?.find(a => a.id === gameId);
    if (inCurrentAccount) {
        // yes: load game
        loadGame(gameId, 'scrabbleLoader');
    } else {
        // no: are there any saved accounts that can be checked?
        if (localStorage.savedAccounts && JSON.parse(localStorage.savedAccounts).length > 0) {
            // yes: do any of those accounts own the game? (server request)

            const sGrid = document.getElementById('scrabbleGrid');
            const oldSGridValue = sGrid.dataset.signedin;
            sGrid.dataset.signedin = 'loading'; // keep showing the scrabble loader
            
            request('findGameOwner.php', {
                accounts: localStorage.savedAccounts,
                gameId: gameId
            }).then(res => {
                if (res.errorLevel > 0) {
                    // no: show error message
                    sGrid.dataset.signedin = oldSGridValue;
                    gameFindError();
                } else {
                    // yes: sign in to that account => load game
                    const acc = JSON.parse(localStorage.savedAccounts)[res.data];
                    signIn(acc.name, acc.pwd).then(() => {
                        loadGame(gameId, 'scrabbleLoader');
                    });
                }
            }).catch(err => {
                // network error (make the user think it never happened)
                sGrid.dataset.signedin = oldSGridValue;
                console.error(err);
                gameFindError();
            });
        } else {
            // no: show error message
            gameFindError();
        }
    }
}

function updateGameHistoryState(gameId) {
    history.pushState({game: gameId}, "Game " + gameId, "?game=" + gameId);
}

window.addEventListener('popstate', e => {
    if (e.state && e.state.game) {
        loadGame(e.state.game, 'loader', false);
    } else {
        showTab('home', false);
    }
});