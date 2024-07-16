function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const options = {
        data: {
            game: 649
        },
        body: msg.text
    };

    self.registration.showNotification(title, options);
}

self.addEventListener('push', receiveNotification);


function notifClick(e) {
    e.preventDefault();
    self.clients.openWindow('https://scrabble.colebot.com?game=' + e.notification.data.game);
}

self.addEventListener('notificationclick', notifClick);