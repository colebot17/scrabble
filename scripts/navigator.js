function checkParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        const gameId = parseInt(params.get('game'));

        // find the game in the user's game list
        if (!account?.games?.find(a => a.id === gameId)) {
            textModal("Game not found", "You are trying to load a game that you don't have access to. Sign in to the correct account to access game <b>#" + gameId + "</b>");
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