function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const options = {
        body: msg.text,
        data: msg.data
    };

    self.registration.showNotification(title, options);
}

self.addEventListener('push', receiveNotification);


function notifClick(e) {
    const params = new URLSearchParams();
    for (let prop in e.notification.data) {
        const item = e.notification.data[prop];
        params.append(prop, item);
    }

    let url = 'https://scrabble.colebot.com';
    const paramsStr = params.toString();
    if (paramsStr) {
        url += '?' + paramsStr;
    }

    console.log(url);

    //self.clients.openWindow(url);

    e.notification.close();
}

self.addEventListener('notificationclick', notifClick);