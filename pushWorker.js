async function receiveNotification(e) {
    const msg = JSON.parse(e.data.text());
    let title = msg.title;
    let options = {
        body: msg.text,
        data: msg.data,
        icon: "assets/appicons/appicon-512.png"
    };

    if (msg.collapse) {
        options.tag = msg.collapse.tag;

        if (await collapseNotifications(options.tag)) {
            title = msg.collapse.title;
            options.body = msg.collapse.text;
        }
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

// returns boolean representing whether or not any notifications were collapsed
async function collapseNotifications(tag) {
    if (!tag) return false;

    // get any other notifications with the same tag
    const allNotifs = await self.registration.getNotifications();
    const taggedNotifs = allNotifs.filter(a => a.tag === tag);

    if (taggedNotifs.length === 0) return false;

    for (let i = 0; i < taggedNotifs.length; i++) {
        taggedNotifs[i].close();
    }

    return true;
}