async function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const game = msg.game;
    const options = {
        data: "https://scrabble.colebot.com",
        body: msg.text
    };

    const notif = await self.registration.showNotification(title, options);

    console.log(notif);

    // notif.addEventListener('click', (e) => {
    //     self.clients.openWindow('https://scrabble.colebot.com?game=' + game);
    // });

    notif.onclick = e => {
        e.preventDefault();
        window.open("https://www.colebot.com/wordsearch", "_blank");
    }
}

self.addEventListener('push', receiveNotification);