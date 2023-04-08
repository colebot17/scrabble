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
    }).catch((error) => {
        console.error(error);
    });
}