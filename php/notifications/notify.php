<?php 

require "sendEmail.php";

// this function sends an email with a specified subject and body to all enabled email addresses of a specified user
function notifyByEmail($conn, $user, $subject, $body) {
    $sql = "SELECT notificationMethods, name FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        return json_encode(Array("errorLevel" => 2, "message" => "User not found"));
    }

    $methods = json_decode($row['notificationMethods'], true);
    $un = $row['name'];

    for ($i = 0; $i < count($methods); $i++) {
        if ($methods[$i]["type"] === "email" && $methods[$i]["enabled"] === true) {
            $greeting = '<h3>Hey ' . $un . '!</h3>';
            $disclaimer = '<p style="font-size:small">You are receiving this email because you signed up for notifications on <a href="https://scrabble.colebot.com">scrabble.colebot.com</a>. <a href="https://scrabble.colebot.com/php/notifications/unsubscribe.php?email=' . $methods[$i]['address'] . '&user=' . $user . '">Unsubscribe</a></p>';
            sendEmail($methods[$i]["address"], $subject, $greeting . $body . $disclaimer);
        }
    }
}


// in the future, this file might also contain a function to notify by push, web, etc.