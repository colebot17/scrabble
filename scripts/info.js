function getInfo() {
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const startPlayer = game.players[0].name;
    const turnPlayer = game.players[game.turn % game.players.length].name;
    const totalTurn = game.turn;
    const lettersLeft = game.lettersLeft;

    const message = /* html */ `
        ${name ? /* html */ `Name: <b>${name}</b>` : ``}
        <br>
        Id: <b>${id}</b>
        <br>
        Created on <b>${creationDate}</b> by <b>${startPlayer}</b>
        <br>
        Turn <b>${totalTurn}</b>: ${turnPlayer}'s turn
        <br>
        <b>${lettersLeft}</b> letters left in bag
    `;

    textModal('Info', message);
}