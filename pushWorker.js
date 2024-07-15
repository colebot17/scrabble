function receiveNotification(e) {
    console.log("[Service Worker] Push Received");

    const text = e.data.text();
    const title = "Yay! It is working!";
    const options = {
        data: "https://scrabble.colebot.com",
        body: text
    };

    e.waitUntil(self.registration.showNotification(title, options));
}

self.addEventListener('push', receiveNotification);