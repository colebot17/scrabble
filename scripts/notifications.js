function manageNotifications() {
    $('#notificationManagerModal').modalOpen();
    displayNotificationMethods();
}

function displayNotificationMethods() {
    const container = document.getElementById('notificationMethodsList');
    container.innerHTML = "";

    for (let i = 0; i < account.notificationMethods.length; i++) {
        const method = account.notificationMethods[i];
        if (method.type !== "email") continue;

        const content = /* html */ `
            <div class="friendListItem emailNotificationMethod">
                <div class="flex flexStart">${method.address}</div>
                <button class="iconButton" onclick="removeNotificationMethod(${i})"><span class="material-symbols-rounded">remove</span></button>
            </div>
        `;

        container.innerHTML += content;
    }

    if (account.notificationMethods.length === 0) {
        container.innerHTML = "<span class='friendListItem'>Add an email address below to receive notifications.</span>";
    }
}

function removeNotificationMethod(index) {
    // remove the notification method
    account.notificationMethods.splice(index, 1);

    displayNotificationMethods();
}

async function addEmailNotificationMethod() {
    const email = document.getElementById('addNotificationEmailBox').value;
    if (!email) return;
    if (!/.+\@.+\..+/gi.test(email)) {
        textModal("Error", "Not a valid email address");
        return;
    }

    document.getElementById('addEmailNotificationMethodButton').disabled = true;

    const res = await request('notifications/addEmail.php', {
        user: account.id,
        pwd: account.pwd,
        email: email
    });

    document.getElementById('addEmailNotificationMethodButton').disabled = false;
    document.getElementById('addNotificationEmailBox').value = "";

    if (res.errorLevel) {
        textModal("Error", res.message);
        return;
    } else {
        account.notificationMethods.push({
            type: "email",
            enabled: true,
            address: email
        });
        displayNotificationMethods();
    }
}