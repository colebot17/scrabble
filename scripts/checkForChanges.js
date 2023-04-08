function checkForChanges() {
    request('checkForChanges.php', {
        user: account.id,
        pwd: account.pwd,
        game: game.id,
        lastUpdate: game.lastUpdate
    }).then((res) => {
        console.log(res);
        if (res.errorLevel > 0) {
            textModal('Error (checkForChanges())', res.message);
            return;
        }
        if (res.data === 1) {
            textModal('Game Changes', 'There is new data associated with this game. Reload the game to see what it is.');
        }
    }).catch((error) => {
        console.error(error);
    });
}