function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const game = msg.game;
    const options = {
        data: "https://scrabble.colebot.com",
        body: msg.text
    };

    self.registration.showNotification(title, options);
}

self.addEventListener('push', receiveNotification);


function notifClick(e) {
    self.clients.openWindow('https://scrabble.colebot.com?game=' + game);
}

self.addEventListener('notificationclick', notifClick);