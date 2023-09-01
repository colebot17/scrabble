function checkParams() {
    // this function assumes that the user is already correctly authenticated
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        loadGame(parseInt(params.get('game')), 'scrabbleLoader');
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