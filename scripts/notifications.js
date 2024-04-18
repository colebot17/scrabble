function manageNotifications() {
    $('#notificationManagerModal').modalOpen();
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