function getInfo() {
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const startPlayer = game.players[0].name;
    const turnPlayer = game.players[game.turn % players.length].name;
    const totalTurn = game.turn;
    const bagCount = game.bagCount;
}