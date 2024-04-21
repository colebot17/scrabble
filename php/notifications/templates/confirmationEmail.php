<?php

function confirmationEmail($name, $emailAddress, $userId) {
    $body = '
        <h1>Email address added successfully</h1>
        <p>
            This email address has been added as a notification method for <b>' . $name . '</b>\'s
            account on <a href="https://scrabble.colebot.com">scrabble.colebot.com</a>.
            <br><br>
            If this email went to your spam box, add <u>scrabble@colebot.com</u> to your address book to ensure
            proper email delivery. Otherwise, you\'re all set!
            <br><br>
            If you did not request this, you can
            <a href="https://scrabble.colebot.com/php/notifications/unsubscribe.php?email=' . $emailAddress . '&user=' . $userId . '">unsubscribe</a>.
        </p>
    ';
    return $body;
}