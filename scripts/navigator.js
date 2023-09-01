function checkParams() {
    // this function assumes that the user is already correctly authenticated
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        const grid = document.getElementById('scrabbleGrid');
        grid.dataset.signedin = "loading";
        loadGame(parseInt(params.get('game'))).then(() => {
            grid.dataset.signedin = "true";
        });
    }
}

function updateHistoryState(gameId) {
    history.pushState({game: gameId}, "Game " + gameId, "?game=" + gameId);
}

window.addEventListener('popstate', e => {
    if (e.state.game) {
        loadGame(e.state.game);
    } else {
        showTab('home');
    }
});