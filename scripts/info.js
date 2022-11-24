function getInfo() {
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const startPlayer = game.players[0].name;
    const turnPlayer = game.players[game.turn % game.players.length].name;
    const totalTurn = game.turn;
    const lettersLeft = game.lettersLeft;

    const message = /* html */ `
        ${name ? `Name: ${name}` : ``}
        <br>
        Id: ${id}
        <br>
        Created on ${creationDate} by ${startPlayer}
        <br>
        Turn ${totalTurn}: ${turnPlayer}'s turn'
        <br>
        <b>${lettersLeft}</b> letters left in bag
    `;

    textModal('Info', message);
}