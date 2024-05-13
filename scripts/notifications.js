const EMAIL_REGEX = /.+\@.+\..+/i;

const emailBox = document.getElementById('addNotificationEmailBox');
const addButton = document.getElementById('addEmailNotificationMethodButton');
emailBox.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        addEmailNotificationMethod();
    } else {
        addButton.disabled = !EMAIL_REGEX.test(emailBox.value);
    }
});

function manageNotifications() {
    $('#notificationManagerModal').modalOpen();
    emailBox.value = "";
    addButton.disabled = true;
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
                <div class="flex col alignFlexStart">
                    <span>${method.address}</span>
                    ${method.enabled ? `` : /* html */ `<span class="finePrint" style="color:red">Disabled</span>`}
                </div>
                <button class="iconButton" onclick="removeNotificationMethod(${i})"><span class="material-symbols-rounded">remove</span></button>
            </div>
        `;

        container.innerHTML += content;
    }

    if (account.notificationMethods.length === 0) {
        container.innerHTML = "<span class='friendListItem'>Add an email address below to receive notifications.</span>";
    }
}

async function removeNotificationMethod(index) {
    const res = await request('notifications/removeMethod.php', {
        user: account.id,
        pwd: account.pwd,
        index: index
    });

    if (res.errorLevel) {
        textModal("Error", res.message);
        return;
    }

    account.notificationMethods.splice(index, 1);
    displayNotificationMethods();
}

async function addEmailNotificationMethod() {
    const email = document.getElementById('addNotificationEmailBox').value.trim();

    if (!email) return;
    if (!EMAIL_REGEX.test(email)) {
        textModal("Error", "Not a valid email address");
        return;
    }
    if (account.notificationMethods.find(a => a.type === "email" && a.enabled === true && a.address === email)) {
        textModal("Error", "You're already getting notifications at this address.");
        return;
    }

    document.getElementById('addEmailNotificationMethodButton').disabled = true;

    const res = await request('notifications/addEmail.php', {
        user: account.id,
        pwd: account.pwd,
        address: email
    });

    document.getElementById('addEmailNotificationMethodButton').disabled = true;
    document.getElementById('addNotificationEmailBox').value = "";

    if (res.errorLevel) {
        textModal("Error", res.message);
        return;
    }

    account.notificationMethods.push({
        type: "email",
        enabled: true,
        address: email
    });
    displayNotificationMethods();

    toast("Email Added", "Check your email for a confirmation");
}