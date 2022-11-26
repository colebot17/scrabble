function getInfo() {
    // common info calculations
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const startPlayer = game.players[0].name;
    const totalTurn = game.turn;

    let message;
    if (!game.inactive) {
        // active info calculations
        const lettersLeft = game.lettersLeft;
        const turnPlayer = game.players[game.turn % game.players.length].name;

        // active info message
        message = /* html */ `
            <div class="flex col" style="gap: 5px">
                ${name ? /* html */ `<div>Name: <b>${name}</b></div>` : ``}
                <div>Id: <b>${id}</b></div>
                <div>Created on <b>${creationDate}</b> by <b>${startPlayer}</b></div>
                <div>Turn <b>${totalTurn}</b>: <b>${turnPlayer}</b>'s turn</div>
                <div><b>${lettersLeft}</b> letters left in bag</div>
            </div>
        `;
    } else {
        // inactive info calculations
        let winner = "No one", winnerPoints = 0;
        for (let i in game.players) {
            if (game.players[i].points > winnerPoints) {
                winnerPoints = game.players[i].points;
                winner = game.players[i].name;
            } else if (game.players[i].points === winnerPoints) {
                winner += ' and ' + game.players[i].name;
            }
        }
        const startDate = new Date(0);
        endDate.setFullYear(creationDate.slice(0, 4));
        endDate.setMonth(creationDate.slice(5, 7));
        endDate.setDate(creationDate.slice(8, 10));

        const endDateString = game.endDate;
        const endDate = new Date(0);
        endDate.setFullYear(endDateString.slice(0, 4));
        endDate.setMonth(endDateString.slice(5, 7));
        endDate.setDate(endDateString.slice(8, 10));
        const days = (endDate.now() - startDate.now()) / 86_400_000; // number of milliseconds in a day

        // inactive info message
        message = /* html */ `
            <div class="flex col" style="gap: 5px">
                ${name ? /* html */ `<div>Name: <b>${name}</b></div>` : ``}
                <div>Id: <b>${id}</b></div>
                <div>Created on <b>${creationDate}</b> by <b>${startPlayer}</b></div>
                <div><b>${winner}</b> won with <b>${winnerPoints}</b> points</div>
                <div>Ended on <b>${endDateString}</b> in <b>${days}</b> days with <b>${totalTurn}</b> moves</div>
            </div>
        `
    }
    

    textModal('Info', message);
}