function checkParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('game')) {
       //loadGame(parseInt(params.get('game')));
       console.log(params.get('game'));
    }
}