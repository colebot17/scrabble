async function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    const title = msg.title;
    const options = {
        body: msg.text,
        data: msg.data,
        icon: "assets/appicons/appicon-512.png"
    };

    if (msg.tag) {
        options.tag = msg.tag;

        // get any other notifications with the same tag
        const allNotifs = await self.registration.getNotifications();
        const taggedNotifs = allNotifs.filter(a => a.tag === msg.tag);

        console.log(allNotifs, taggedNotifs);
    }

    self.registration.showNotification(title, options);
}

self.addEventListener('push', receiveNotification);


function notifClick(e) {
    self.clients.openWindow(genURL(e.notification.data));

    e.notification.close();
}

self.addEventListener('notificationclick', notifClick);


function genURL(paramsObj) {
    const params = new URLSearchParams();
    for (let prop in paramsObj) {
        const item = paramsObj[prop];
        params.append(prop, item);
    }

    let url = 'https://scrabble.colebot.com';
    const paramsStr = params.toString();
    if (paramsStr) {
        url += '?' + paramsStr;
    }

    return url;
}