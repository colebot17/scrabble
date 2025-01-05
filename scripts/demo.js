async function demo() {
    await signIn("Demo Account", "", false);
    for (let i = 0; i < account.games.length; i++) {
        const g = account.games[i];

        const isUsersTurn = parseInt(g.players[parseInt(g.turn) % g.players.length].id) === account.id

        if (isUsersTurn && !g.inactive) {
            loadGame(g.id);
            return;
        }
    }

    for (let i = 0; i < account.games.length; i++) {
        const g = account.games[i];

        if (!g.inactive) {
            loadGame(g.id);
            return;
        }
    }
}

document.getElementById('demoButton').addEventListener('click', demo);