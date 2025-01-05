async function demo() {
    await signIn("Demo Account", "", false, true);

    let cts = [];
    for (let i = 0; i < account.games.length; i++) {
        const g = account.games[i];
        const isUsersTurn = parseInt(g.players[parseInt(g.turn) % g.players.length].id) === account.id
        
        if (!g.inactive && isUsersTurn) cts.push(g);
    }
    if (cts.length > 0) {
        let randId = cts[Math.floor(Math.random() * cts.length)].id;
        loadGame(randId);
        return;
    }

    let actives = [];
    for (let i = 0; i < account.games.length; i++) {
        const g = account.games[i];
        if (!g.inactive) actives.push(g);
    }
    if (actives.length > 0) {
        let randId = actives[Math.floor(Math.random() * cts.length)].id;
        loadGame(randId);
        return;
    }
}

document.getElementById('demoButton').addEventListener('click', demo);