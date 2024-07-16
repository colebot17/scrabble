function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const options = {
        data: "https://scrabble.colebot.com",
        body: msg.text
    };

    // self.registration.showNotification(title, options);

    new Notification(title, options);
}

self.addEventListener('push', receiveNotification);