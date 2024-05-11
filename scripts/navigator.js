function checkParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        const gameId = parseInt(params.get('game'));

        // make sure the game id is a number
        if (isNaN(gameId)) {
            textModal("Invalid game id", "The url-specified game is not a valid game id. Check your link and try again.");
            return;
        }

        // make sure the game is in the user's game list
        if (!account?.games?.find(a => a.id === gameId)) {
            // if there are multiple accounts saved
            if (localStorage.savedAccounts) {
                let accs = JSON.parse(localStorage.savedAccounts);
                if (accs.length > 0) {
                    request('findGameOwner.php', {
                        accounts: localStorage.savedAccounts,
                        gameId: gameId
                    }).then(res => {
                        if (res.errorLevel > 1) {
                            textModal("Error", res.message);
                            return;
                        };

                        if (res.errorLevel === 1) {
                            textModal("Game not found", "You are trying to load a game that you don't have access to. Sign in to the correct account to access game <b>#" + gameId + "</b>");
                            return;
                        }

                        const ownerAcc = accs[res.data];
                        signIn(ownerAcc.name, ownerAcc.pwd).then(() => {
                            loadGame(gameId, 'scrabbleLoader');
                        });
                    });
                }
            }
            return;
        }

        loadGame(gameId, 'scrabbleLoader');
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