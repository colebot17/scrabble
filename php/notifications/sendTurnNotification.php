<?php

require "notify.php";

function sendTurnNotification($conn, $user, $game) {
    notifyByEmail($conn, $user, "It's your turn!", "Come make your Scrabble move on Colebot.com!");
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


var_dump(sendTurnNotification($conn, 1, 476));