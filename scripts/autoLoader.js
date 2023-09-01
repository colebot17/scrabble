function checkParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
        loadGame(params.get('game'));
    }
}