function checkForChanges() {
    const postObj = {
        user: account.id,
        pwd: account.pwd,
        game: game.id,
        lastUpdate: game.lastUpdate
    }
    const post = JSON.stringify(postObj);
    const url = location + "/php/checkForChanges.php";

    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: post
    }).then(response => response.json()).then((res) => {
        console.log(res);
        if (res.errorLevel > 0) {
            textModal('Error', res.message);
            return;
        }
    }).catch((error) => {
        console.error(error);
    });
}