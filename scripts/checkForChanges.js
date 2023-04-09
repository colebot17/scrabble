var checkInterval = setInterval(checkForChanges, 3000);

function checkForChanges() {
    request('checkForChanges.php', {
        user: account.id,
        pwd: account.pwd,
        game: game.id,
        updateNumber: game.updateNumber
    }).then((res) => {
        console.log(res);
        if (res.errorLevel > 0) {
            textModal('Error (checkForChanges())', res.message);
            return;
        }
        if (res.data.length > 0) {
            textModal('Game Changes', 'There is new data associated with this game. Reload the game to see what it is.');
        }
    }).catch((error) => {
        console.error(error);
    });
}