function manageNotifications() {
    $('#notificationManagerModal').modalOpen();
    emailBox.value = "";
    addEmailButton.disabled = true;
    displayNotificationMethods();
    setNotificationPage();
}

function displayNotificationMethods() {
    const container = document.getElementById('notificationMethodsList');
    container.innerHTML = "";

    for (let i = 0; i < account.notificationMethods.length; i++) {
        const met = account.notificationMethods[i];

        let content = '';

        switch (met.type) {
            case "email":
                content = /* html */ `
                    <div class="friendListItem notificationMethod">
                        <div class="flex col alignFlexStart noGap">
                            <span>${met.address}</span>
                            ${met.enabled ? `` : /* html */ `<span class="finePrint" style="color:red">Disabled</span>`}
                        </div>
                        <button class="iconButton" onclick="removeNotificationMethod(${i})"><span class="material-symbols-rounded">remove</span></button>
                    </div>
                `;
                break;

            case "sms":
                content = /* html */ `
                    <div class="friendListItem notificationMethod">
                        <div class="flex col alignFlexStart noGap">
                            <span>(${met.number.slice(0, 3)}) ${met.number.slice(3, 6)} - ${met.number.slice(6, 10)}</span>
                            <span>
                                <span class="finePrint">${met.carrier}</span>
                                ${met.enabled ? `` : /* html */ `<span class="finePrint" style="color:red"> - Disabled</span>`}
                            </span>
                        </div>
                        <button class="iconButton" onclick="removeNotificationMethod(${i})"><span class="material-symbols-rounded">remove</span></button>
                    </div>
                `;
                break;
            
            default:
                break;
        }

        container.innerHTML += content;
    }

    if (account.notificationMethods.length === 0) {
        container.innerHTML = "<span class='friendListItem'>Add an email address below to receive notifications.</span>";
    }
}


const EMAIL_REGEX = /.+\@.+\..+/i;

const emailBox = document.getElementById('addNotificationEmailBox');
const addEmailButton = document.getElementById('addEmailNotificationMethodButton');
emailBox.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        addEmailNotificationMethod();
    } else {
        addEmailButton.disabled = !EMAIL_REGEX.test(emailBox.value);
    }
});

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


const numberBox = document.getElementById('addSMSNumberBox');
const carrierBox = document.getElementById('addSMSCarrierBox');
const addSMSButton = document.getElementById('addSMSNotificationMethodButton');
numberBox.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        addSMSNotificationMethod();
    } else {
        addEmailButton.disabled = numberBox.value.replaceAll(/\D/g, '').length === 10;
    }
});

async function addSMSNotificationMethod() {
    const number = numberBox.value.replace(/\D/g, '');
    const carrier = carrierBox.value;

    if (!number || !carrier) return;
    if (number.length !== 10) {
        textModal("Error", "Enter your phone number in 10-digit format without the country code");
        return;
    }
    if (account.notificationMethods.find(a => a.type === "sms" && a.enabled && a.number === number && a.carrier === carrier)) {
        textModal("Error", "You're already getting notifications at this number");
        return;
    }

    const res = await request('notifications/addSMS.php', {
        user: account.id,
        pwd: account.pwd,
        number,
        carrier
    });

    if (res.errorLevel > 0) {
        textModal("Error", res.message);
    }

    account.notificationMethods.push({
        type: "sms",
        enabled: true,
        number,
        carrier
    });
    displayNotificationMethods();

    toast("SMS Number Added", "Check your messages for a confirmation");
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