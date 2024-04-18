<?php

require "sendEmail.php";

function sendTurnNotification($conn, $user, $game) {

    $sql = "SELECT notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        return Array("errorLevel" => 2, "message" => "User not found");
    }

    $methods = json_decode($row['notificationMethods'], true);

    for ($i = 0; $i < count($methods); $i++) {
        if ($methods[$i]["type"] === "email") {
            sendEmail($methods[$i]["address"], "Test Email", "This will eventually become the turn notification email.");
        }
    }

    //sendEmail($to, $subject, $body);
}

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


sendTurnNotification($conn, 1, 476);