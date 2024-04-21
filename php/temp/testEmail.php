<?php

require "../notifications/notify.php";
require "../notifications/templates/turnEmail.php";

$emailBody = turnEmail("LastPlayer", "Cool Game", 123, Array("Cole", "test", "scrabblerookie"));

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

notifyByEmail($conn, 1, "Scrabble Test Email", $emailBody);

echo $emailBody;