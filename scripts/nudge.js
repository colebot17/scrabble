function nudge() {
    request('nudge.php', {
        user: account.id,
        pwd: account.pwd,
        gameId: game.id,
    }).then(res => {
        if (res.errorLevel > 0) {
            textModal("Error", res.message);
            return;
        }

        textModal("Nudge Sent", res.message);
    })
}