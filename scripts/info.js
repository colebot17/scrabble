function getInfo() {
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const startPlayer = game.players[0].name;
    const turnPlayer = game.players[game.turn % game.players.length].name;
    const totalTurn = game.turn;
    const lettersLeft = game.lettersLeft;

    const message = /* html */ `
        <div class="flex col" style="gap: 5px">
            ${name ? /* html */ `<div>Name: <b>${name}</b></div>` : ``}
            <div>Id: <b>${id}</b></div>
            <div>Created on <b>${creationDate}</b> by <b>${startPlayer}</b></div>
            <div>Turn <b>${totalTurn}</b>: <b>${turnPlayer}</b>'s turn</div>
            <div><b>${lettersLeft}</b> letters left in bag</div>
        </div>
    `;

    textModal('Info', message);
}