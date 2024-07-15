function receiveNotification(e) {
    console.log("[Service Worker] Push Received");

    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const options = {
        data: "https://scrabble.colebot.com",
        body: msg.text
    };

    self.registration.showNotification(title, options);
}

self.addEventListener('push', receiveNotification);