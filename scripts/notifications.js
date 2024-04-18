function manageNotifications() {
    $('#notificationManagerModal').modalOpen();
    displayNotificationMethods();
}

async function addEmail(email) {
    // validate email

    const res = await request('notifications/addEmail.php', {
        user: account.id,
        pwd: account.pwd,
        email: email
    });

    if (res.errorLevel) {
        textModal("Error", res.message);
        return;
    }
}

function displayNotificationMethods() {
    const container = document.getElementById('notificationMethodsList');
    container.innerHTML = "";

    for (let i = 0; i < account.notificationMethods.length; i++) {
        const method = account.notificationMethods[i];
        if (method.type !== email) continue;

        const content = /* html */ `
            <div class="friendListItem emailNotificationMethod">
                <div class="flex flexStart">${method.address}</div>
                <button class="iconButton" onclick="removeNotificationMethod(${i})"><span class="material-symbols-rounded">remove</span></button>
            </div>
        `;

        container.innerHTML += content;
    }
}

function removeNotificationMethod(index) {
    // remove the notification method
    account.notificationMethods.splice(index, 1);

    displayNotificationMethods();
}