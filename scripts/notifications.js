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
                            <span>(${met.number.slice(0, 3)}) ${met.number.slice(3, 6)}&ndash;${met.number.slice(6, 10)}</span>
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

    addEmailButton.disabled = true;

    const res = await request('notifications/addEmail.php', {
        user: account.id,
        pwd: account.pwd,
        address: email
    });

    addEmailButton.disabled = true;
    emailBox.value = "";

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
const smsUpdate = e => {
    if (e.key === "Enter") {
        addSMSNotificationMethod();
    } else {
        addSMSButton.disabled = numberBox.value.replace(/\D/g, '').length !== 10 || !carrierBox.value;
    }
};
numberBox.addEventListener('keyup', smsUpdate);
carrierBox.addEventListener('change', smsUpdate);

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

    addSMSButton.disabled = true;

    const res = await request('notifications/addSMS.php', {
        user: account.id,
        pwd: account.pwd,
        number,
        carrier
    });

    numberBox.value = "";
    carrierBox.value = "";

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


if ("serviceWorker" in navigator && "PushManager" in window) {
    const btn = document.getElementById('pushSubscribeButton');
    btn.disabled = false;
    btn.title = "";
    
    navigator.serviceWorker.register("pushWorker.js");

    btn.addEventListener('click', () => {
        Notification.requestPermission().then(res => {
            if (res === "granted") {

                console.log(navigator.serviceWorker.ready);
                navigator.serviceWorker.ready.then(() => console.log("ready"));

                navigator.serviceWorker.ready.then(worker => {
                    return worker.pushManager.subscribe({
                        userVisibleOnly: true,
                        // applicationServerKey: urlB64ToUint8Array("BE1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXhHZE0rSTQ1eFBaWURyQ2E1aFc3QjM3UHFaM1B1ZnZiUEVZUmQwYXJBdW8vM0VyMGR3elIzeTZRZHFaYVRpTjF6Rm4xdExJVjczQXpmMFFTalBXb013PT0")
                    }).then(sub => {
                        console.log(sub);
                        return sub;
                    });
                })

                // navigator.serviceWorker.ready.then(worker => {
                //     worker.showNotification('hi', 'this is a test');
                // });

                // navigator.serviceWorker.register("./workers/push.js");
                
                // navigator.serviceWorker.ready.then(registration => {
                //     registration.pushManager.subscribe({userVisibleOnly: true});
                // });
            }
        });
    });
}

