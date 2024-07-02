<?php

// this script is responsible for keeping track of what notification types there are
// and coordinating their formulation and delivery

function notify($conn, $user, $notifType, $notifOptions) {
    // this function delivers a notification of the specified type to the specified user via all methods
    
    // ensure the type is valid
    $notificationTypes = Array("friendRequest", "newGame", "nudge", "turn");
    if (!in_array($notifType, $notificationTypes)) {
        return Array("success" => false, "message" => "Invalid notification type");
    }

    $sql = "SELECT notificationMethods, name FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        return Array("success" => false, "message" => "User not found");
    }

    $methods = json_decode($row['notificationMethods'], true);
    $un = $row['name'];
    for ($i = 0; $i < count($methods); $i++) {
        $met = $methods[$i];
        if (!array_key_exists('disabled', $met) || !$met["disabled"]) {
            switch ($met["type"]) {
                case 'email':
                    require_once "templates/email.php";
                    [$subject, $body] = $emailTemplates[$notifType](...$notifOptions);
                    require_once "sendEmail.php";
                    $greeting = '<h3 style="margin-bottom:-1em">Hey ' . $un . ',</h3>';
                    $disclaimer = '<p style="font-size:small">You are receiving this email because you signed up for notifications on <a href="https://scrabble.colebot.com">scrabble.colebot.com</a>. <a href="https://scrabble.colebot.com/php/notifications/unsubscribe.php?email=' . $methods[$i]['address'] . '&user=' . $user . '">Unsubscribe</a></p>';
                    sendEmail($met["address"], $subject, $greeting . $body . $disclaimer);
                    break;
                
                default:
                    // do nothing (unsupported notification method)
                    break;
            }
        }
    }

    return Array("success" => true, "message" => "Notification(s) sent");
}

// require "sendEmail.php";

// // this function sends an email with a specified subject and body to all enabled email addresses of a specified user
// function notifyByEmail($conn, $user, $subject, $body) {
//     $sql = "SELECT notificationMethods, name FROM accounts WHERE id='$user'";
//     $query = mysqli_query($conn, $sql);
//     $row = mysqli_fetch_assoc($query);
//     if (!$row) {
//         return json_encode(Array("errorLevel" => 2, "message" => "User not found"));
//     }

//     $methods = json_decode($row['notificationMethods'], true);
//     $un = $row['name'];

//     for ($i = 0; $i < count($methods); $i++) {
//         if ($methods[$i]["type"] === "email" && $methods[$i]["enabled"] === true) {
//             $greeting = '<h3 style="margin-bottom:-1em">Hey ' . $un . ',</h3>';
//             $disclaimer = '<p style="font-size:small">You are receiving this email because you signed up for notifications on <a href="https://scrabble.colebot.com">scrabble.colebot.com</a>. <a href="https://scrabble.colebot.com/php/notifications/unsubscribe.php?email=' . $methods[$i]['address'] . '&user=' . $user . '">Unsubscribe</a></p>';
//             sendEmail($methods[$i]["address"], $subject, $greeting . $body . $disclaimer);
//         }
//     }
// }