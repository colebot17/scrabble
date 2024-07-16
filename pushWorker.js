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
    let url = 'https://scrabble.colebot.com';
    if (e.notification.data.game) url += `?game=${e.notification.data.game}`;
    self.clients.openWindow(url);
}

self.addEventListener('notificationclick', notifClick);